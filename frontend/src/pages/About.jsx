import '../css/about.css';

export default function About() {
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const year = new Date().getFullYear();

  const CONTACT = {
    email: 'yasser@abdulmala.de',
    github: 'https://github.com/yas177200',
    linkedin: 'https://www.linkedin.com/in/yasser-abdulmala-684ab4362/',
    website: 'https://abdulmala.de/ideaforge'
  };

  return (
    <div className="about">
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="avatar" aria-hidden>
            {(me?.name || 'IF').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1>About {me?.name || 'IdeaForge Creator'}</h1>
            <p className="tagline">
              Web Dev Junior at <strong>IRAD Academy</strong> • Cybersecurity student at
              {' '}<strong>Ruhr University Bochum</strong>
            </p>
            <p className="sub">
              I love building clean, real-time web apps—fast, secure, and pragmatic. IdeaForge is my end-to-end
              learning project that blends ideation, discussion, and live collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* PROJECT OVERVIEW */}
      <section className="section">
        <h2>What is IdeaForge?</h2>
        <p>
          <strong>IdeaForge</strong> is a collaborative project ideation & discussion platform. Teams create projects,
          add idea cards, like & comment, and chat in real-time—everything scoped to private invite links.
          It’s designed to be simple to demo, easy to onboard, and fun to use.
        </p>

        <div className="pill-row">
          <span className="pill">JWT Auth</span>
          <span className="pill">Projects & Members</span>
          <span className="pill">Idea Cards</span>
          <span className="pill">Likes & Comments</span>
          <span className="pill">Real-Time Chat</span>
          <span className="pill">Owner/Member Roles</span>
          <span className="pill">Dashboard Tabs (My/Joined/Pending)</span>
          <span className="pill">Membership Approvals</span>
          <span className="pill">Dockerized</span>
        </div>
      </section>

      {/* WHY / VALUE */}
      <section className="section grid-2">
        <div>
          <h3>Why I built it</h3>
          <ul className="list">
            <li>Practice a clean React + Node/Express + PostgreSQL stack.</li>
            <li>Explore real-time patterns with Socket.IO (rooms, auth, events).</li>
            <li>Design a pragmatic permissions model (owner vs. approved member).</li>
            <li>Ship Docker-first and reverse-proxy behind Apache on an Ubuntu VM.</li>
          </ul>
        </div>
        <div>
          <h3>What it helps with</h3>
          <ul className="list">
            <li>Rapidly structuring raw ideas into actionable cards.</li>
            <li>Asynchronous feedback via likes & comments.</li>
            <li>Live discussion without context switching (in-app chat).</li>
            <li>Simple onboarding via private invite links with approvals.</li>
          </ul>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h2>Feature Highlights</h2>
        <div className="features">
          <Feature
            title="Projects & Membership"
            text="Create projects, share invite links, approve or decline join requests. Pending tab shows your outstanding requests."
          />
          <Feature
            title="Idea Cards"
            text="Types: Feature, Bug, Idea, Sketch. Each card supports likes, comments, and completion state."
          />
          <Feature
            title="Comments & Modals"
            text="Clean, modal-based comment flow for reading, adding, editing, and deleting."
          />
          <Feature
            title="Real-Time Chat"
            text="Per-project chat with Socket.IO, membership-gated. Typing hints and instant delivery."
          />
          <Feature
            title="Simple, Fast UI"
            text="Custom CSS, responsive layout, sticky sub-nav, and focused UX for Board vs Overview."
          />
          <Feature
            title="Docker + Apache"
            text="Dev in Docker; deploy behind Apache with SSL at /ideaforge. Vertical scaling on a single VM."
          />
        </div>
      </section>

      <section className="section">
        <h2>Tech Stack</h2>
        <div className="stack">
          <StackBadge>React + Vite</StackBadge>
          <StackBadge>Raw CSS</StackBadge>
          <StackBadge>React Router</StackBadge>
          <StackBadge>Axios</StackBadge>
          <StackBadge>Node.js + Express</StackBadge>
          <StackBadge>Sequelize + PostgreSQL</StackBadge>
          <StackBadge>Socket.IO</StackBadge>
          <StackBadge>Docker Compose</StackBadge>
          <StackBadge>Apache (Reverse Proxy)</StackBadge>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section">
        <h2>Contact</h2>
        <div className="contact">
          <a className="contact-card" href={`mailto:${CONTACT.email}`}>
            <span className="icon">✉️</span>
            <div>
              <div className="label">Email</div>
              <div className="value">{CONTACT.email}</div>
            </div>
          </a>
          <a className="contact-card" href={CONTACT.github} target="_blank" rel="noreferrer">
            <span className="icon">🐙</span>
            <div>
              <div className="label">GitHub</div>
              <div className="value">{CONTACT.github.replace('https://', '')}</div>
            </div>
          </a>
          <a className="contact-card" href={CONTACT.linkedin} target="_blank" rel="noreferrer">
            <span className="icon">🔗</span>
            <div>
              <div className="label">LinkedIn</div>
              <div className="value">{CONTACT.linkedin.replace('https://', '')}</div>
            </div>
          </a>
          <a className="contact-card" href={CONTACT.website} target="_blank" rel="noreferrer">
            <span className="icon">🌐</span>
            <div>
              <div className="label">Website</div>
              <div className="value">{CONTACT.website.replace('https://', '')}</div>
            </div>
          </a>
        </div>
      </section>

      <footer className="about-footer">
        <p>© {year} IdeaForge • Built with 💙 by {me?.name || 'a happy web dev'}</p>
      </footer>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="feature">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function StackBadge({ children }) {
  return <span className="stack-badge">{children}</span>;
}
