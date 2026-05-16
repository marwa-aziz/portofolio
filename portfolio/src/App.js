import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COLORS = {
  pink: "#FF6B9D",
  yellow: "#FFD93D",
  cyan: "#4ECDC4",
  purple: "#A855F7",
  orange: "#FF9F43",
  green: "#6BCB77",
};

const NAV_LINKS = ["About", "Skills", "Projects", "Contact"];

const SKILLS = [
  { name: "HTML & CSS", level: 90, color: COLORS.orange },
  { name: "JavaScript", level: 85, color: COLORS.yellow },
  { name: "Angular", level: 80, color: COLORS.cyan },
  { name: "TypeScript", level: 70, color: COLORS.purple },
  { name: "Figma", level: 85, color: COLORS.pink },
  { name: "Git & GitHub", level: 75, color: COLORS.green },
  { name: "Tailwind CSS", level: 65, color: COLORS.pink },
  { name: "React", level: 60, color: COLORS.green },
];

const PROJECTS = [
  {
    title: "Forex website",
    desc: "React app that fetches real-time weather using OpenWeather API with animated icons.",
    tags: ["React", "API", "CSS"],
    color: COLORS.cyan,
    emoji: "📉",
  },
  {
    title: "Nutrition / healthy food website",
    desc: "Full CRUD todo app with drag-and-drop, local storage persistence, and filters.",
    tags: ["React", "Hooks", "LocalStorage"],
    color: COLORS.purple,
    emoji: "🥑",
  },
  {
    title: "Gym website",
    desc: "My first portfolio site built with pure HTML/CSS — responsive and accessible.",
    tags: ["HTML", "CSS", "Responsive"],
    color: COLORS.pink,
    emoji: "💪",
  },
  {
    title: "trading company website",
    desc: "Search thousands of recipes by ingredient using Spoonacular API.",
    tags: ["React", "API", "Tailwind"],
    color: COLORS.orange,
    emoji: "🌍",
  },
];

// ─── THREE.JS SCENE ──────────────────────────────────────────────────────────
function useThreeScene(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 8;

    // Ambient + directional light
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // ── Floating shapes ───────────────────────────────────────────────────────
    const colorList = Object.values(COLORS);
    const shapes = [];

    const geometries = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.6, 0),
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.TorusGeometry(0.4, 0.15, 8, 12),
      new THREE.ConeGeometry(0.4, 0.8, 6),
    ];

    for (let i = 0; i < 22; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshPhongMaterial({
        color: colorList[i % colorList.length],
        shininess: 80,
        specular: 0x444444,
      });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 2
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      // Store animation params
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.3 + Math.random() * 0.4,
        floatAmp: 0.3 + Math.random() * 0.3,
        originY: mesh.position.y,
        phase: Math.random() * Math.PI * 2,
      };

      scene.add(mesh);
      shapes.push(mesh);
    }

    // ── Mouse parallax ────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Animate ───────────────────────────────────────────────────────────────
    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      shapes.forEach((m) => {
        const d = m.userData;
        m.rotation.x += d.rotSpeedX;
        m.rotation.y += d.rotSpeedY;
        m.position.y = d.originY + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
      });

      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [canvasRef]);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Navbar({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "1rem 2rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: scrolled ? "rgba(10,10,20,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "background 0.3s, backdrop-filter 0.3s",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
    }}>
      <span style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: "1.6rem",
        background: `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.cyan})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "1px",
      }}>
        {"MARWA"}
      </span>

      <div style={{ display: "flex", gap: "1.8rem" }}>
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            onClick={() => setActive(link)}
            style={{
              color: active === link ? COLORS.cyan : "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
              transition: "color 0.2s, transform 0.2s",
              display: "inline-block",
              transform: active === link ? "translateY(-1px)" : "none",
            }}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  );
}


function HeroSection({ canvasRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="hero" style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 0,
        }}
      />

      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(10,10,25,0.45) 0%, rgba(5,5,15,0.75) 100%)",
        zIndex: 1,
      }} />

      {/* Hero text */}
      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center", padding: "0 1.5rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          color: COLORS.cyan, fontSize: "1rem",
          letterSpacing: "3px", textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}>
          👋 Hello, I'm
        </p>

        <h1 style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: "clamp(3rem, 8vw, 6rem)",
          margin: "0 0 0.5rem",
          background: `linear-gradient(135deg, #fff 20%, ${COLORS.pink} 60%, ${COLORS.yellow})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}>
          Marwa
        </h1>

        <h2 style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
          color: "rgba(255,255,255,0.75)",
          margin: "0 0 2rem",
          letterSpacing: "1px",
        }}>
          Frontend Developer  &amp;  Creative Coder ✨
        </h2>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#projects" style={btnStyle(COLORS.pink, true)}>See My Work 🚀</a>
          <a href="#contact" style={btnStyle("transparent", false)}>Contact Me</a>
        </div>

        <div style={{ marginTop: "4rem", animation: "bounce 2s infinite" }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", letterSpacing: "2px" }}>
            SCROLL DOWN ↓
          </span>
        </div>
      </div>
    </section>
  );
}

const btnStyle = (bg, filled) => ({
  display: "inline-block",
  padding: "0.75rem 2rem",
  borderRadius: "999px",
  textDecoration: "none",
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  background: filled ? bg : "transparent",
  color: filled ? "#fff" : "rgba(255,255,255,0.8)",
  border: filled ? "none" : "1.5px solid rgba(255,255,255,0.3)",
  boxShadow: filled ? `0 0 25px ${bg}60` : "none",
});


function AboutSection() {
  return (
    <section id="about" style={sectionStyle}>
      <SectionTitle emoji="🙋‍♂️" label="About" color={COLORS.yellow} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem",
        maxWidth: 900,
        margin: "0 auto",
        alignItems: "center",
      }}>
        {/* Avatar blob */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 220, height: 220,
            borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
            background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "5rem",
            boxShadow: `0 0 60px ${COLORS.purple}50`,
            animation: "blobMorph 6s ease-in-out infinite",
          }}>
            🧑‍💻
          </div>
        </div>

        {/* Text */}
        <div>
          <p style={{ ...bodyText, marginBottom: "1rem" }}>
            I'm a Frontend Developer who loves building{" "}
            <span style={{ color: COLORS.cyan, fontWeight: 700 }}>beautiful</span>,{" "}
            <span style={{ color: COLORS.pink, fontWeight: 700 }}>interactive</span>{" "}
            web experiences. I'm currently learning React and Three.js to bring my ideas to life in 3D.
          </p>
          <p style={{ ...bodyText, marginBottom: "1.5rem" }}>
            When I'm not coding, I'm exploring new design trends, playing video games, or sketching UI ideas on paper. ✏️
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {["Cairo, Egypt 🇪🇬", "Open to Work 💼", "React Learner ⚛️"].map((tag) => (
              <span key={tag} style={{
                padding: "0.35rem 0.9rem",
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'Nunito', sans-serif",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function SkillsSection() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" style={{ ...sectionStyle, background: "rgba(255,255,255,0.02)" }} ref={ref}>
      <SectionTitle emoji="⚡" label="Skills" color={COLORS.cyan} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "1.2rem",
        maxWidth: 820,
        margin: "0 auto",
      }}>
        {SKILLS.map((skill, i) => (
          <div key={skill.name} style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            padding: "1rem 1.4rem",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: animated ? 1 : 0,
            transform: animated ? "translateX(0)" : "translateX(-20px)",
            transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                {skill.name}
              </span>
              <span style={{ fontFamily: "'Nunito', sans-serif", color: skill.color, fontWeight: 700, fontSize: "0.9rem" }}>
                {skill.level}%
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: animated ? `${skill.level}%` : "0%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${skill.color}99, ${skill.color})`,
                boxShadow: `0 0 10px ${skill.color}80`,
                transition: `width 1s ease ${i * 0.07 + 0.2}s`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function ProjectsSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="projects" style={sectionStyle}>
      <SectionTitle emoji="🚀" label="Projects" color={COLORS.purple} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        maxWidth: 900,
        margin: "0 auto",
      }}>
        {PROJECTS.map((p, i) => (
          <div
            key={p.title}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${hovered === i ? p.color + "60" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 18,
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: hovered === i ? "translateY(-6px)" : "none",
              boxShadow: hovered === i ? `0 20px 40px ${p.color}25` : "none",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{p.emoji}</div>
            <h3 style={{
              fontFamily: "'Fredoka One', cursive",
              color: p.color,
              fontSize: "1.3rem",
              margin: "0 0 0.5rem",
            }}>
              {p.title}
            </h3>
            <p style={{ ...bodyText, fontSize: "0.88rem", marginBottom: "1rem", color: "rgba(255,255,255,0.6)" }}>
              {p.desc}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {p.tags.map((tag) => (
                <span key={tag} style={{
                  padding: "0.2rem 0.7rem",
                  borderRadius: 999,
                  background: p.color + "20",
                  border: `1px solid ${p.color}50`,
                  color: p.color,
                  fontSize: "0.75rem",
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async () => {
    if (form.name && form.email && form.message) {
      await fetch("https://formspree.io/f/xqenrrqa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.85rem 1.1rem",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <section id="contact" style={{ ...sectionStyle, background: "rgba(255,255,255,0.02)" }}>
      <SectionTitle emoji="📩" label="Contact" color={COLORS.pink} />

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ ...bodyText, textAlign: "center", marginBottom: "2rem", color: "rgba(255,255,255,0.6)" }}>
          Got a project idea or just want to say hi? Drop me a message! 👇
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <textarea
            name="message"
            placeholder="Your Message ✨"
            rows={5}
            value={form.message}
            onChange={handleChange}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "0.85rem",
              borderRadius: 999,
              border: "none",
              background: sent
                ? `linear-gradient(135deg, ${COLORS.green}, #4ade80)`
                : `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.purple})`,
              color: "#fff",
              fontFamily: "'Fredoka One', cursive",
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.5px",
              boxShadow: `0 0 30px ${COLORS.pink}50`,
            }}
          >
            {sent ? "Sent! 🎉" : "Send Message 🚀"}
          </button>
        </div>

        {/* Social links */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.2rem", marginTop: "2.5rem" }}>
          {[
            { label: "GitHub", href: "https://github.com/marwa-aziz", emoji: "🐙" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/marwa-aziz-9366a7366", emoji: "💼" },

          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.cyan)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            >
              {s.emoji} {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


function SectionTitle({ emoji, label, color }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        color,
        letterSpacing: "3px",
        textTransform: "uppercase",
        fontSize: "0.8rem",
        marginBottom: "0.5rem",
      }}>
        {emoji} {label}
      </p>
      <h2 style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: "clamp(2rem, 5vw, 3rem)",
        color: "#fff",
        margin: 0,
        lineHeight: 1.1,
      }}>
        {label} Section
        <span style={{ color }}> ✦</span>
      </h2>
    </div>
  );
}

const sectionStyle = {
  padding: "6rem 2rem",
  maxWidth: "100%",
};

const bodyText = {
  fontFamily: "'Nunito', sans-serif",
  color: "rgba(255,255,255,0.8)",
  fontSize: "1rem",
  lineHeight: 1.7,
  margin: 0,
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const canvasRef = useRef();
  const [active, setActive] = useState("");

  useThreeScene(canvasRef);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "skills", "projects", "contact"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActive(id.charAt(0).toUpperCase() + id.slice(1));
            return;
          }
        }
      }
      setActive("");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background: #07071a;
          color: #fff;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #07071a; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.purple}80; border-radius: 999px; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0);   opacity: 0.4; }
          50%       { transform: translateY(8px); opacity: 0.8; }
        }

        @keyframes blobMorph {
          0%,100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%; }
          25%      { border-radius: 50% 50% 40% 60% / 60% 40% 70% 30%; }
          50%      { border-radius: 40% 60% 50% 50% / 30% 70% 60% 50%; }
          75%      { border-radius: 70% 30% 60% 40% / 50% 50% 30% 70%; }
        }
      `}</style>

      <Navbar active={active} setActive={setActive} />

      <main>
        <HeroSection canvasRef={canvasRef} />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>

      <footer style={{
        textAlign: "center",
        padding: "2rem",
        fontFamily: "'Nunito', sans-serif",
        color: "rgba(255,255,255,0.3)",
        fontSize: "0.85rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        Made with 💜 + React + Three.js — Your Name © 2025
      </footer>
    </>
  );
}
