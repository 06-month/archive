"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="container-overview">
      <Navbar />
      {/* PROFILE HERO */}
      <section className="card-custom profile-hero col-span-8 flex flex-col justify-between" style={{ minHeight: "420px" }}>
        <div className="hero-header">
          <span className="tag-custom">Researcher Identity</span>
        </div>
        <div className="profile-content">
          <h1 className="text-4xl font-extrabold tracking-tight leading-none mt-6" style={{ fontSize: "46px", fontWeight: 800 }}>
            Hi, I'm Jun Jeon (전준)
          </h1>
          <p className="mt-5 text-zinc-500 text-sm leading-relaxed" style={{ fontSize: "14.5px", color: "var(--text-secondary)", maxWidth: "650px" }}>
            I study 3D Computer Vision, Neural Rendering, and Novel View Synthesis for robust 3D scene representation and reconstruction.<br /><br />
            Currently, I am an Undergraduate Researcher at the <strong>UNIST Vision &amp; Learning Lab (UVLL)</strong> advised by Prof. Seungryul Baek, focusing on 3D hand pose estimation and reconstruction. Prior to this, I researched semantic segmentation, domain adaptation, and long-tail federated learning at <strong>AiRLab, Hanbat National University</strong>.
          </p>
          <div className="contact-links flex gap-2 mt-6">
            <a href="https://github.com/06-month" className="contact-btn" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:firstn1028@gmail.com" className="contact-btn">Email Contact</a>
            <a href="https://06-month.github.io/home/Jun%20Jeon%20CV.pdf?v=10" className="contact-btn" target="_blank" rel="noopener noreferrer">Curriculum Vitae</a>
          </div>
        </div>
        <div className="hero-meta mt-8">
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
            UNIST / Ulsan, South Korea (LAT: 35.5728 / LONG: 129.1903)
          </span>
        </div>
      </section>

      {/* AVATAR CARD */}
      <section className="card-custom profile-avatar-card col-span-4 flex flex-col justify-between" style={{ backgroundColor: "#1A1A1A", color: "white", minHeight: "420px" }}>
        <div>
          <span className="tag-custom" style={{ backgroundColor: "#2A2A2A", borderColor: "#333", color: "#AAA" }}>Researcher Profile</span>
          <div className="profile-avatar-placeholder" style={{ width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent) 0%, #00B1A5 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 800, color: "white", marginTop: "40px", boxShadow: "0 0 0 8px rgba(0, 209, 178, 0.1)" }}>
            J
          </div>
          <div className="avatar-info mt-6">
            <h3 style={{ fontSize: "22px", fontWeight: 700 }}>Jun Jeon</h3>
            <p style={{ fontSize: "13px", color: "#8E8E93", marginTop: "4px" }}>3D Computer Vision / AI Research Student</p>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #333", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px" }}>
          <span style={{ fontSize: "12px", color: "#8E8E93" }}>Status: Hand Pose &amp; Recon</span>
          <span className="tag-custom" style={{ backgroundColor: "#2A2A2A", borderColor: "#333", color: "var(--accent)" }}>● ACTIVE</span>
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <div className="section-header col-span-12">
        <h2>Academic &amp; Research Journey</h2>
        <hr />
      </div>

      <section className="card-custom timeline-card col-span-12">
        <span className="tag-custom" style={{ marginBottom: "24px" }}>Research Timeline &amp; Education</span>
        
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-date">Mar. 2026 - Present</div>
            <h4 className="timeline-title">Undergraduate Researcher</h4>
            <div className="timeline-subtitle">UNIST Vision &amp; Learning Lab (UVLL)</div>
            <p className="timeline-desc">
              Advised by Prof. Seungryul Baek. Focusing on research in 3D hand pose estimation and hand mesh reconstruction.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">Jun. 2025 - Mar. 2026</div>
            <h4 className="timeline-title">Undergraduate Researcher</h4>
            <div className="timeline-subtitle">AiRLab, Hanbat National University</div>
            <p className="timeline-desc">
              Advised by Prof. Dong-Geol Choi. Conducted research on computer vision, deep learning semantic segmentation, representation learning, and federated learning architectures.
            </p>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-date">Mar. 2025 - Present</div>
            <h4 className="timeline-title">B.S. in Computer Engineering</h4>
            <div className="timeline-subtitle">Hanbat National University</div>
            <p className="timeline-desc">
              Current GPA: <strong>3.79 / 4.5</strong> (Major GPA: 3.79 / 4.5). Focused coursework in computer vision, machine learning, and systems engineering.
            </p>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-date">Mar. 2021 - Dec. 2022</div>
            <h4 className="timeline-title">B.S. Coursework in Software Engineering</h4>
            <div className="timeline-subtitle">Pai Chai University</div>
            <p className="timeline-desc">
              Completed initial coursework. GPA: <strong>4.14 / 4.5</strong> (Major GPA: 4.32 / 4.5). Established strong foundations in software design, logic, and data structures.
            </p>
          </div>
        </div>
      </section>

      {/* PUBLICATIONS */}
      <div className="section-header col-span-12">
        <h2>Publications</h2>
        <hr />
      </div>

      <section className="card-custom publication-card col-span-12" style={{ borderLeft: "4px solid var(--accent)" }}>
        <span className="tag-custom" style={{ marginBottom: "20px" }}>Conference Proceedings</span>
        <div className="pub-item flex flex-col gap-2">
          <span className="pub-conf text-xs font-semibold" style={{ color: "var(--accent)", letterSpacing: "0.05em" }}>
            KICS Winter Conference 2026
          </span>
          <h3 className="pub-title text-lg font-bold">
            Balanced Knowledge Distillation (BKD) for Long-Tail Federated Learning Based on CLIP2FL
          </h3>
          <p className="pub-authors text-sm text-zinc-500">
            <em>Jun Jeon</em>, Minu Baek, Sangkeum Lee
          </p>
        </div>
      </section>

      {/* SELECTED PROJECTS */}
      <div className="section-header col-span-12">
        <h2>Selected Projects</h2>
        <hr />
      </div>

      <div className="projects-grid col-span-12 grid grid-cols-3 gap-5">
        <div className="project-card flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Research</span>
              <span className="project-date mono">2026.05 - Present</span>
            </div>
            <div className="project-body">
              <h3>3D Low-Light Enhancement for Robust NVS</h3>
              <p>Independent experimental study participating in the NTIRE 2026 Challenge. Investigating low-light degradation and baseline methods for robust Novel View Synthesis and 3DGS.</p>
            </div>
          </div>
          <div className="project-tech flex flex-wrap gap-1.5 mt-4">
            <span className="tech-badge">3DGS</span>
            <span className="tech-badge">Low-Light</span>
            <span className="tech-badge">PyTorch</span>
          </div>
        </div>

        <div className="project-card flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Research</span>
              <span className="project-date mono">2026.04 - Present</span>
            </div>
            <div className="project-body">
              <h3>Geometry-Preserving Synthetic-to-Real Dataset Refinement</h3>
              <p>Independent research project focused on 3D hand reconstruction. Investigating geometry-preserving domain adaptation techniques to minimize sim-to-real appearance and shape gaps.</p>
            </div>
          </div>
          <div className="project-tech flex flex-wrap gap-1.5 mt-4">
            <span className="tech-badge">3D Hand Recon</span>
            <span className="tech-badge">Domain Adaptation</span>
            <span className="tech-badge">PyTorch</span>
          </div>
        </div>

        <div className="project-card flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Engineering</span>
              <span className="project-date mono">2026.03 - Present</span>
            </div>
            <div className="project-body">
              <h3>On-Device Human Pose Estimation</h3>
              <p>Capstone Design Project. Leading the AI pipeline of a mobile application for real-time exercise posture coaching using on-device pose keypoints and joint-angle heuristic scoring.</p>
            </div>
          </div>
          <div className="project-tech flex flex-wrap gap-1.5 mt-4">
            <span className="tech-badge">On-Device</span>
            <span className="tech-badge">Pose Estimation</span>
            <span className="tech-badge">Mobile AI</span>
          </div>
        </div>

        <div className="project-card flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Seminar</span>
              <span className="project-date mono">2026.01 - 2026.02</span>
            </div>
            <div className="project-body">
              <h3>Satellite Image Building Area Segmentation</h3>
              <p>AiRLab coding seminar project. Developed and optimized deep learning semantic segmentation models for high-accuracy building extraction from satellite imagery.</p>
            </div>
          </div>
          <div className="project-tech flex flex-wrap gap-1.5 mt-4">
            <span className="tech-badge">Semantic Seg</span>
            <span className="tech-badge">U-Net</span>
            <span className="tech-badge">Satellite Vision</span>
          </div>
        </div>

        <div className="project-card flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Academic</span>
              <span className="project-date mono">2025.11 - 2025.12</span>
            </div>
            <div className="project-body">
              <h3>Satellite Cloud Semantic Segmentation</h3>
              <p>Computer Vision course term project. Implemented multi-class semantic segmentation models for classifying satellite image regions into thick cloud, thin cloud, and cloud shadow.</p>
            </div>
          </div>
          <div className="project-tech flex flex-wrap gap-1.5 mt-4">
            <span className="tech-badge">Computer Vision</span>
            <span className="tech-badge">PyTorch</span>
            <span className="tech-badge">Satellite</span>
          </div>
        </div>

        <div className="project-card flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Research</span>
              <span className="project-date mono">2025.10 - 2025.12</span>
            </div>
            <div className="project-body">
              <h3>CLIP2FL-based Federated Learning Research</h3>
              <p>IoT Project developing a Balanced Knowledge Distillation (BKD) framework for long-tail federated learning, leading to a conference publication at KICS Winter 2026.</p>
            </div>
          </div>
          <div className="project-tech flex flex-wrap gap-1.5 mt-4">
            <span className="tech-badge">Federated Learning</span>
            <span className="tech-badge">CLIP</span>
            <span className="tech-badge">BKD</span>
          </div>
        </div>
      </div>

      {/* SKILLS & ACHIEVEMENTS */}
      <div className="section-header col-span-12">
        <h2>Skills &amp; Achievements</h2>
        <hr />
      </div>

      <section className="card-custom skills-card col-span-8">
        <span className="tag-custom">Technical Stack &amp; Tools</span>
        
        <div className="skills-container">
          <div className="skills-category">
            <h4>3D Computer Vision Core</h4>
            <div className="skills-list">
              <span className="skill-tag">3D Gaussian Splatting</span>
              <span className="skill-tag">Neural Rendering</span>
              <span className="skill-tag">Novel View Synthesis</span>
              <span className="skill-tag">Camera Geometry</span>
              <span className="skill-tag">Multi-View Geometry</span>
            </div>
          </div>

          <div className="skills-category">
            <h4>Deep Learning &amp; Computer Vision</h4>
            <div className="skills-list">
              <span className="skill-tag">PyTorch</span>
              <span className="skill-tag">OpenCV</span>
              <span className="skill-tag">NumPy</span>
              <span className="skill-tag">Semantic Segmentation</span>
              <span className="skill-tag">Federated Learning</span>
            </div>
          </div>

          <div className="skills-category">
            <h4>Programming Languages</h4>
            <div className="skills-list">
              <span className="skill-tag">Python</span>
              <span className="skill-tag">C++</span>
              <span className="skill-tag">C#</span>
              <span className="skill-tag">Java</span>
              <span className="skill-tag">SQL</span>
              <span className="skill-tag">MATLAB</span>
            </div>
          </div>

          <div className="skills-category">
            <h4>Developer Tools</h4>
            <div className="skills-list">
              <span className="skill-tag">Git</span>
              <span className="skill-tag">Docker</span>
              <span className="skill-tag">Linux</span>
              <span className="skill-tag">Vim</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card-custom achievements-card col-span-4">
        <div>
          <span className="tag-custom">Honors &amp; Credentials</span>
          
          <div className="achievement-section">
            <h4>Awards &amp; Competitions</h4>
            <ul className="achievement-list">
              <li>
                <strong>1st Place (Grand Prize)</strong>
                <span>Open Source Software Utilization Competition (Nov. 2025)</span>
                <span className="text-zinc-400">Hanbat National University — "Budgetly" OCR finance app</span>
              </li>
            </ul>
          </div>

          <div className="achievement-section" style={{ marginTop: "32px" }}>
            <h4>Certifications</h4>
            <ul className="achievement-list">
              <li>
                <strong>AWS Certified Cloud Practitioner</strong>
                <span>Amazon Web Services (CLF-C02)</span>
              </li>
              <li style={{ marginTop: "12px" }}>
                <strong>NCP Certified Associate</strong>
                <span>Naver Cloud Platform (NCA)</span>
              </li>
            </ul>
          </div>

          <div className="achievement-section" style={{ marginTop: "32px", marginBottom: "24px" }}>
            <h4>Language Proficiency</h4>
            <ul className="achievement-list">
              <li>
                <strong>TOEIC 800</strong>
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <span className="mono" style={{ color: "#666", fontSize: "11px" }}>Last Updated: 2026.06.14</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
