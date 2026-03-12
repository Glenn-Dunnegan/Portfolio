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
  "Sass",
  "Node.js",
  "REST APIs",
  "SQL",
  "Responsive UI",
  "GitHub Pages"
];

const projects: Project[] = [
  {
    title: "Business Website",
    description: "A polished small-business website focused on lead generation, responsiveness, and clear service messaging.",
    stack: ["React", "TypeScript", "Sass"],
    linkLabel: "View project",
    linkHref: "#projects"
  },
  {
    title: "Full-Stack App",
    description: "A web application with front-end and back-end integration, emphasizing reusable components and maintainable structure.",
    stack: ["React", "Node.js", "SQL"],
    linkLabel: "See details",
    linkHref: "#projects"
  },
  {
    title: "Portfolio Platform",
    description: "A personal brand site designed to showcase skills, work samples, and easy ways for clients or employers to connect.",
    stack: ["Vite", "TypeScript", "GitHub Pages"],
    linkLabel: "Explore more",
    linkHref: "#contact"
  }
];

function App() {
  const year = new Date().getFullYear();

  return (
    <>
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="#top">
            Portfolio
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
              <p className="eyebrow">Developer • Designer • Problem Solver</p>
              <h1>Building clean, modern web experiences that turn ideas into working products.</h1>
              <p className="lead">
                I create responsive websites and applications with a focus on clarity, performance, and maintainable code.
                This starter portfolio is built with React, TypeScript, and Sass to deploy easily on GitHub Pages.
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
              <p className="panel-label">Currently focused on</p>
              <ul>
                <li>Responsive front-end development</li>
                <li>Reusable React component systems</li>
                <li>Type-safe UI architecture</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container split-layout">
            <div>
              <p className="section-tag">About</p>
              <h2>Creating digital work that feels professional and approachable.</h2>
            </div>
            <div className="content-card">
              <p>
                I build websites and applications that are fast, easy to use, and designed with real users in mind. My work centers on
                thoughtful layouts, scalable front-end structure, and practical solutions that support business goals.
              </p>
              <p>
                This project is a ready-to-edit portfolio starter. Swap in your own bio, project links, resume, and contact details to make it yours.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-muted" id="skills">
          <div className="container">
            <p className="section-tag">Skills</p>
            <h2>Tools and technologies I enjoy using.</h2>
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
            <h2>Selected work and starter examples.</h2>
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
                  <a href={project.linkHref}>{project.linkLabel}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-cta" id="contact">
          <div className="container contact-shell">
            <div>
              <p className="section-tag">Contact</p>
              <h2>Let’s build something useful together.</h2>
              <p>
                Replace these placeholders with your real contact information, social links, or a form service such as Formspree.
              </p>
            </div>
            <div className="content-card contact-card">
              <a href="mailto:yourname@example.com">yourname@example.com</a>
              <a href="https://github.com/yourusername">GitHub Profile</a>
              <a href="https://www.linkedin.com/in/yourusername/">LinkedIn Profile</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-shell">
          <p>© {year} Portfolio. Built with React, TypeScript, and Sass.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
