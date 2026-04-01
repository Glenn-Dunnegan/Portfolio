import { useEffect, useRef, useState } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL as string | undefined;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const MIN_SUBMIT_MS = 4000;

type Project = {
  title: string;
  description: string;
  stack: string[];
  linkLabel: string;
  linkHref: string;
};

const skills = [
  "React",
  "TypeScript",
  "JavaScript",
  "Sass",
  "Node.js",
  "REST APIs",
  "MongoDB",
  "Responsive UI",
  "Landing Pages",
  "Contact Form Fixes",
  "Performance Improvements",
  "GitHub Pages"
];

const heroServiceBadges = [
  "React + TypeScript Builds",
  "Landing Page Refreshes",
  "Contact Form + Spam Protection",
  "Responsive Performance Fixes"
];

const projects: Project[] = [
  {
    title: "Roofing Company",
    description: "A polished service-business landing page rebuilt with React, TypeScript, and Sass for a cleaner workflow and easier future updates.",
    stack: ["React", "TypeScript", "Sass"],
    linkLabel: "Live demo",
    linkHref: "https://roofing-biz.netlify.app/"
  },
  {
    title: "Freelance Finance",
    description: "A responsive React and TypeScript application that helps freelancers manage financial information through a clean, practical interface.",
    stack: ["React", "TypeScript", "Finance UI"],
    linkLabel: "Live demo",
    linkHref: "https://freelance-finance.com/"
  },
  {
    title: "Field Service REST API",
    description: "A full-stack Node.js and Express REST API built for a real service business. Features JWT authentication, role-based access control, job and work order management, image uploads, password reset with email, and real-time schedule updates via Socket.io. Backed by MongoDB with Mongoose.",
    stack: ["Node.js", "Express", "MongoDB", "JWT", "Socket.io"],
    linkLabel: "View code",
    linkHref: "https://github.com/Glenn-Dunnegan/Epjrapi"
  },
  {
    title: "Portfolio Site",
    description: "This portfolio, built with React, TypeScript, Sass, and a Cloudflare Worker backend for the contact form. Includes Turnstile spam protection, a honeypot field, and request timing checks.",
    stack: ["Vite", "TypeScript", "Sass", "Cloudflare Workers"],
    linkLabel: "Contact me",
    linkHref: "#contact"
  }
];

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const startedAtRef = useRef(Date.now());
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined);
  const initAttemptedRef = useRef(false);
  const missingConfigVars: string[] = [];

  if (!CONTACT_API_URL) {
    missingConfigVars.push("VITE_CONTACT_API_URL");
  }

  if (!TURNSTILE_SITE_KEY) {
    missingConfigVars.push("VITE_TURNSTILE_SITE_KEY");
  }

  const isMissingConfig = missingConfigVars.length > 0;
  const showDevConfigHint = import.meta.env.DEV && isMissingConfig;

  function resetTurnstile() {
    setTurnstileToken("");
    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  function resetFormState() {
    setName("");
    setEmail("");
    setMessage("");
    setCompany("");
    resetTurnstile();
    startedAtRef.current = Date.now();
  }

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileContainerRef.current) {
      return;
    }

    const renderWidget = () => {
      if (initAttemptedRef.current) {
        return;
      }

      if (!window.turnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) {
        return;
      }

      try {
        initAttemptedRef.current = true;
        turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            setTurnstileToken(token);
            setErrorMessage("");
          },
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken("")
        });
      } catch {
        setStatus("error");
        setErrorMessage("Captcha could not initialize. Check allowed domains in Turnstile settings.");
      }
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderWidget, { once: true });
      return () => existingScript.removeEventListener("load", renderWidget);
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget, { once: true });
    script.addEventListener(
      "error",
      () => {
        setStatus("error");
        setErrorMessage("Captcha script failed to load.");
      },
      { once: true }
    );
    document.head.appendChild(script);

    return () => script.removeEventListener("load", renderWidget);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const elapsedMs = Date.now() - startedAtRef.current;
    const filledHoneypot = company.trim().length > 0;

    // Ignore likely bot submissions without sending anything to Formspree.
    if (filledHoneypot || elapsedMs < MIN_SUBMIT_MS) {
      setStatus("success");
      resetFormState();
      return;
    }

    if (!CONTACT_API_URL) {
      setStatus("error");
      setErrorMessage(
        import.meta.env.DEV
          ? "Missing VITE_CONTACT_API_URL in .env for local testing."
          : "Contact endpoint is not configured."
      );
      return;
    }

    if (!TURNSTILE_SITE_KEY) {
      setStatus("error");
      setErrorMessage(
        import.meta.env.DEV
          ? "Missing VITE_TURNSTILE_SITE_KEY in .env for local testing."
          : "Captcha site key is not configured."
      );
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setErrorMessage("Please complete the spam check before submitting.");
      return;
    }

    setStatus("loading");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message, turnstileToken }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        setStatus("success");
        resetFormState();
      } else {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus("error");
        if (payload?.error === "spam_suspected") {
          setErrorMessage("Please remove links/promotional text and provide a normal project message.");
        } else {
          setErrorMessage("Verification failed. Please try again.");
        }
        resetTurnstile();
      }
    } catch {
      setStatus("error");
      setErrorMessage("Request timed out or failed. Please try again.");
      resetTurnstile();
    }
  }

  if (status === "success") {
    return (
      <div className="form-feedback form-feedback--success">
        <p>Thanks! I'll get back to you soon.</p>
        <button className="button button-secondary" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {showDevConfigHint && (
        <p className="form-feedback form-feedback--info" role="status" aria-live="polite">
          Local setup missing: {missingConfigVars.join(", ")}. Add these values to your .env file.
        </p>
      )}
      {status === "error" && (
        <p className="form-feedback form-feedback--error" role="alert">
          {errorMessage || "Something went wrong — please try again or email me directly."}
        </p>
      )}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <input
        aria-hidden="true"
        autoComplete="off"
        name="company"
        onChange={(e) => setCompany(e.target.value)}
        style={{ display: "none" }}
        tabIndex={-1}
        type="text"
        value={company}
      />
      <div className="form-group">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          rows={5}
          placeholder="How can I help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minLength={10}
          required
        />
      </div>
      {!isMissingConfig && <div className="turnstile-wrap" ref={turnstileContainerRef} />}
      <button className="button button-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

function App() {
  const year = new Date().getFullYear();

  return (
    <>
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="#top">
            Glenn Dunnegan
          </a>
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#skills">Skills</a>
              </li>
              <li>
                <a href="#projects">Projects</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Front-End Developer • React • Conversion-Focused Fixes</p>
              <h1>From broken pages to polished experiences, I ship practical front-end upgrades fast.</h1>
              <p className="lead">
                I help small businesses improve trust and usability with clean React builds, better mobile layouts, stronger contact
                workflows, and targeted performance updates that make websites feel professional and reliable.
              </p>
              <div className="hero-badge-grid" aria-label="Core services">
                {heroServiceBadges.map((item) => (
                  <span key={item} className="hero-badge">
                    {item}
                  </span>
                ))}
              </div>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">
                  View Projects
                </a>
                <a className="button button-secondary" href="#contact">
                  Contact Me
                </a>
              </div>
            </div>
            <aside className="hero-panel" aria-label="Quick summary card">
              <p className="panel-label">Core strengths</p>
              <ul>
                <li>Diagnosing and fixing front-end issues quickly</li>
                <li>Building modern landing pages for service businesses</li>
                <li>Improving contact forms, usability, and trust signals</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container split-layout">
            <div>
              <p className="section-tag">About</p>
              <h2>Practical front-end work built around clarity, speed, and real business needs.</h2>
            </div>
            <div className="content-card">
              <p>
                I’ve been steadily building my web development skills with a strong focus on front-end implementation and full-stack fundamentals.
                My goal is simple: deliver websites that look professional, work reliably, and solve actual problems for the people using them.
              </p>
              <p>
                I enjoy modern React workflows, clean TypeScript structure, and improving existing sites when they need better layout, stronger
                usability, or faster performance.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-muted" id="skills">
          <div className="container">
            <p className="section-tag">Skills</p>
            <h2>Tools and services I use to improve business websites.</h2>
            <div className="pill-grid">
              {skills.map((skill) => (
                <span key={skill} className="pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="container">
            <p className="section-tag">Projects</p>
            <h2>Recent work and representative examples.</h2>
            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.title} className="project-card">
                  <div className="project-accent" />
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <ul className="tech-list">
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <a href={project.linkHref} target={project.linkHref.startsWith("http") ? "_blank" : undefined} rel={project.linkHref.startsWith("http") ? "noreferrer" : undefined}>
                    {project.linkLabel}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-cta" id="contact">
          <div className="container contact-shell">
            <div className="contact-info">
              <p className="section-tag">Contact</p>
              <h2>Need help improving a site or shipping a front-end update?</h2>
              <p>
                If you need layout fixes, a landing page, a small React feature, or general front-end cleanup, I'm available to talk through the work.
              </p>
              <ul className="contact-links">
                <li>
                  <a href="mailto:glenn.dunnegan@gmail.com">glenn.dunnegan@gmail.com</a>
                </li>
                <li>
                  <a href="https://github.com/Glenn-Dunnegan" target="_blank" rel="noreferrer">
                    github.com/Glenn-Dunnegan
                  </a>
                </li>
              </ul>
            </div>
            <div className="content-card">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-shell">
          <p>© {year} Glenn Dunnegan. Built with React, TypeScript, and Sass.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
