import { useEffect, useRef, useState } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL as string | undefined;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const MIN_SUBMIT_MS = 4000;

type Project = {
  title: string;
  description: string;
  highlights: string[];
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
  "JWT Authentication",
  "Role-Based Access Control",
  "API Integration",
  "Analytics Integration",
  "Form Validation",
  "Deployment Workflows",
  "Technical SEO Basics",
  "Responsive UI",
  "Performance Improvements",
  "Component-Based UI"
];

const heroServiceBadges = [
  "React + TypeScript Interfaces",
  "Responsive Front-End Implementation",
  "REST API Integration",
  "Production-Minded UI Fixes"
];

const projects: Project[] = [
  {
    title: "Roofing Company",
    description: "A polished service-business landing page rebuilt with React, TypeScript, and Sass for a cleaner workflow and easier future updates.",
    highlights: [
      "Rebuilt the site with a modern React and TypeScript structure for easier long-term maintenance.",
      "Improved responsive layout and presentation for a service business that needs trust and clarity on mobile.",
      "Used Sass for cleaner styling organization and faster iteration on UI updates."
    ],
    stack: ["React", "TypeScript", "Sass"],
    linkLabel: "Live demo",
    linkHref: "https://roofing-biz.netlify.app/"
  },
  {
    title: "Freelance Finance",
    description: "A responsive React and TypeScript application for freelance pricing and invoicing, expanded with guide content, analytics, and technical SEO work aimed at crawlability and discoverability.",
    highlights: [
      "Built a multi-route React application with calculator, invoice, and guide pages structured for both usability and crawlable content discovery.",
      "Added canonical and robots metadata, GA4 page-view tracking, and guide content routes to support technical SEO and content visibility.",
      "Set up GitHub Actions build checks plus crawler-focused production verification for the homepage, guide pages, robots.txt, sitemap.xml, ads.txt, and built assets."
    ],
    stack: ["React", "TypeScript", "React Router", "Technical SEO", "GA4", "GitHub Actions"],
    linkLabel: "Live demo",
    linkHref: "https://freelance-finance.com/"
  },
  {
    title: "Field Service REST API",
    description: "A full-stack Node.js and Express REST API built for a real service business. Features JWT authentication, role-based access control, job and work order management, image uploads, password reset with email, and real-time schedule updates via Socket.io. Backed by MongoDB with Mongoose.",
    highlights: [
      "Implemented JWT authentication and role-based access control for protected business workflows.",
      "Built REST endpoints for jobs, work orders, uploads, and password reset flows backed by MongoDB.",
      "Implemented an automated notation/audit trail system for administrative account actions, logging who made user or role changes, what changed, and when, with paginated note retrieval for admin views."
    ],
    stack: ["Node.js", "Express", "MongoDB", "JWT", "Socket.io", "Audit Logging"],
    linkLabel: "View code (admin notation/audit trail)",
    linkHref: "https://github.com/Glenn-Dunnegan/Epjrapi"
  },
  {
    title: "Portfolio Site",
    description: "This portfolio, built with React, TypeScript, Sass, and a Cloudflare Worker backend for the contact form. Includes Turnstile spam protection, a honeypot field, and request timing checks.",
    highlights: [
      "Built a frontend contact workflow with validation, timeout handling, and clear error states.",
      "Added worker-side spam filtering, Turnstile verification, and origin checks for safer form handling.",
      "Set up a practical deployment-friendly structure with Vite on the frontend and a Cloudflare Worker backend."
    ],
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
              <p className="eyebrow">Web Developer • React • TypeScript • Full-Stack Fundamentals</p>
              <h1>I build responsive web applications with clean front-end implementation and practical backend support.</h1>
              <p className="lead">
                I focus on React, TypeScript, and modern web application work: building polished interfaces, integrating APIs,
                improving usability across devices, and shipping maintainable features that support real business needs.
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
              <p className="panel-label">What I bring</p>
              <ul>
                <li>React and TypeScript UI implementation with a strong responsive foundation</li>
                <li>API integration and backend fundamentals including Node.js, auth flows, and MongoDB</li>
                <li>Practical product thinking around usability, reliability, and maintainable code structure</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container split-layout">
            <div>
              <p className="section-tag">About</p>
              <h2>Front-end focused development with hands-on full-stack experience.</h2>
            </div>
            <div className="content-card">
              <p>
                I build modern web experiences with a focus on React, TypeScript, responsive implementation, and clear user-facing results.
                My work is strongest on the front end, but I am also comfortable supporting application needs with backend APIs,
                authentication flows, MongoDB, and deployment-oriented tooling.
              </p>
              <p>
                I am especially interested in roles where I can contribute across UI implementation, API integration, product polish,
                and day-to-day web application improvements inside a collaborative engineering team.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-muted" id="skills">
          <div className="container">
            <p className="section-tag">Skills</p>
            <h2>Core tools and engineering areas I can contribute in today.</h2>
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
            <h2>Selected work that shows practical front-end and full-stack experience.</h2>
            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.title} className="project-card">
                  <div className="project-accent" />
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <ul className="project-points">
                    {project.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
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
              <h2>Open to Front-End and Full-Stack Web Developer Opportunities.</h2>
              <p>
                If you are hiring for a role involving React, TypeScript, responsive UI work, or practical full-stack web development,
                I would be glad to talk.
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
