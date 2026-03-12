import { useState } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

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

const projects: Project[] = [
  {
    title: "Roofing Company",
    description: "A polished service-business landing page rebuilt with React, TypeScript, and Sass for a cleaner workflow and easier future updates.",
    stack: ["React", "TypeScript", "Sass"],
    linkLabel: "View code",
    linkHref: "https://github.com/Glenn-Dunnegan"
  },
  {
    title: "Freelance Finance",
    description: "A responsive React and TypeScript application that helps freelancers manage financial information through a clean, practical interface.",
    stack: ["React", "TypeScript", "Finance UI"],
    linkLabel: "Live demo",
    linkHref: "https://freelance-finance.com/"
  },
  {
    title: "Portfolio Site",
    description: "This GitHub Pages portfolio, designed to present services, project highlights, and a professional front-end presence with fast deployment.",
    stack: ["Vite", "GitHub Pages", "TypeScript"],
    linkLabel: "Contact me",
    linkHref: "#contact"
  }
];

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!FORMSPREE_ID) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
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
      {status === "error" && (
        <p className="form-feedback form-feedback--error">
          Something went wrong — please try again or email me directly.
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
      <div className="form-group">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          rows={5}
          placeholder="How can I help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
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
              <p className="eyebrow">Web Developer • React • Website Fixes</p>
              <h1>I help businesses fix and improve their websites quickly.</h1>
              <p className="lead">
                I’m Glenn Dunnegan, a web developer focused on responsive front-end work, small React features, landing pages,
                broken page fixes, contact forms, and performance improvements that make sites easier to use and easier to trust.
              </p>
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
              <p className="panel-label">What I help with</p>
              <ul>
                <li>Mobile layout fixes and responsive updates</li>
                <li>Landing pages and business website improvements</li>
                <li>Small React and JavaScript features</li>
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
