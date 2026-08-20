"use client";

function RepoLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="project-repo-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub 저장소 열기"
      title="GitHub 저장소"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
    </a>
  );
}

export default function About() {
  return (
    <div className="container-overview about-page">
      {/* PROFILE HERO */}
      <section className="card-custom profile-hero col-span-8">
        <div className="hero-header">
          <span className="tag-custom">Academic Profile</span>
        </div>
        <div className="profile-content">
          <h1 className="profile-title">
            Jun Jeon
          </h1>
          <p className="profile-lead">
            Computer Engineering undergraduate at Hanbat National University,
            <br />
            studying feed-forward 3D/4D scene reconstruction and dynamic Gaussian representations.
          </p>
          <div className="profile-meta-list">
            <div>
              <span>Current Focus</span>
              <strong>Feed-forward 3D/4D reconstruction · dynamic Gaussians</strong>
            </div>
            <div>
              <span>Research Interests</span>
              <strong>Dynamic Gaussians, motion modeling, neural rendering</strong>
            </div>
            <div>
              <span>Cumulative GPA</span>
              <strong>4.02 / 4.5 · Major 4.07 / 4.5</strong>
            </div>
          </div>
          <div className="interest-chip-row">
            <span>Feed-Forward Reconstruction</span>
            <span>3D/4D Scene Reconstruction</span>
            <span>Dynamic Gaussian Representations</span>
            <span>Motion Modeling</span>
            <span>Efficient Neural Rendering</span>
          </div>
          <div className="contact-links">
            <a href="https://github.com/06-month" className="contact-btn" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.61 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.73-1.34-1.73-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.5.12-3.13 0 0 1-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.28-1.52 3.29-1.2 3.29-1.2.65 1.63.24 2.83.12 3.13.77.82 1.23 1.87 1.23 3.15 0 4.5-2.81 5.49-5.49 5.78.43.36.81 1.08.81 2.18 0 1.58-.01 2.85-.01 3.24 0 .32.21.69.83.57A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
              </svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jun-jeon-1b61273b2/" className="contact-btn" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
              LinkedIn
            </a>
            <a href="mailto:junjeon@edu.hanbat.ac.kr" className="contact-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email Contact
            </a>
            <a href="/JunJeon_CV.pdf" className="contact-btn" target="_blank" rel="noopener noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Curriculum Vitae
            </a>
          </div>
        </div>
        <div className="hero-meta mt-8">
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Hanbat National University / Computer Engineering · Studying Feed-Forward 3D/4D Reconstruction &amp; Dynamic Gaussians
          </span>
        </div>
      </section>

      {/* AVATAR CARD */}
      <section className="card-custom profile-avatar-card col-span-4">
        <div>
          <span className="tag-custom profile-card-tag">Researcher Profile</span>
          <div className="profile-avatar-block">
            <img
              src="/junjeon.jpg"
              alt="Jun Jeon"
              className="avatar-img"
            />
            <div className="avatar-info">
              <h3>Jun Jeon</h3>
              <p>
                3D/4D Scene Representation
                <br />
                / AI Research Student
              </p>
            </div>
          </div>
        </div>
        <div className="profile-status-row">
          <span>Status: 3D Vision &amp; Neural Rendering</span>
          <span className="tag-custom profile-active-tag">● ACTIVE</span>
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
            <div className="timeline-date">Mar. 2026 - Jun. 2026</div>
            <h4 className="timeline-title">Undergraduate Researcher / Intern</h4>
            <div className="timeline-subtitle">UNIST Vision &amp; Learning Lab (UVLL)</div>
            <p className="timeline-desc">
              Advised by Prof. Seungryul Baek at Ulsan National Institute of Science and Technology. Undergraduate research on 3D hand pose estimation and 3D hand reconstruction.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">Jun. 2025 - Mar. 2026</div>
            <h4 className="timeline-title">Undergraduate Researcher</h4>
            <div className="timeline-subtitle">AiRLab, Hanbat National University</div>
            <p className="timeline-desc">
              Advised by Prof. Dong-Geol Choi. Undergraduate research on computer vision, image classification, and semantic segmentation.
            </p>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-date">Mar. 2025 - Present</div>
            <h4 className="timeline-title">B.S. in Computer Engineering</h4>
            <div className="timeline-subtitle">Hanbat National University</div>
            <p className="timeline-desc">
              Current GPA: <strong>3.85 / 4.5</strong> with Major GPA: <strong>3.82 / 4.5</strong>. Relevant coursework includes Artificial Intelligence, Computer Vision, Reinforcement Learning, and Metaverse and Digital Space Theory.
            </p>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-date">Mar. 2021 - Dec. 2022</div>
            <h4 className="timeline-title">Previous Undergraduate Coursework in Software Engineering</h4>
            <div className="timeline-subtitle">Pai Chai University</div>
            <p className="timeline-desc">
              Completed undergraduate coursework in Software Engineering. GPA: <strong>4.14 / 4.5</strong>, Major GPA: <strong>4.32 / 4.5</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* PUBLICATIONS */}
      <div className="section-header col-span-12">
        <h2>Publications</h2>
        <hr />
      </div>

      <section className="card-custom publication-card col-span-12">
        <div className="publication-inner">
          <div className="pub-item">
            <span className="tag-custom" style={{ width: "fit-content" }}>Conference Proceedings</span>
            <span className="pub-conf">
              KICS Winter Conference 2026
            </span>
            <h3 className="pub-title">
              Balanced Knowledge Distillation (BKD) for Long-Tail Federated Learning Based on CLIP2FL
            </h3>
            <p className="pub-authors">
              <em>Jun Jeon</em>, Minu Baek, Sangkeum Lee†
            </p>
          </div>
        </div>
      </section>

      {/* SELECTED PROJECTS */}
      <div className="section-header col-span-12">
        <h2>Selected Projects</h2>
        <hr />
      </div>

      <div className="projects-grid col-span-12 grid grid-cols-3 gap-5">
        <div className="project-card project-card-featured flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Research Eng.</span>
              <span className="project-date mono">2026.08 - Present</span>
            </div>
            <div className="project-body">
              <h3>Exercise3D Multi-View Dataset Pipeline</h3>
              <p>End-to-end pipeline converting synchronized triple-camera exercise video into camera poses, 3D joints, and parametric body fits. Processed 26 sequences / 78 camera views / 65,595 frames, with 24 of 26 sequences completed end-to-end under per-frame quality validation.</p>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-tech flex flex-wrap gap-1.5">
              <span className="tech-badge">Multi-View Geometry</span>
              <span className="tech-badge">3D Human Motion</span>
              <span className="tech-badge">Bundle Adjustment</span>
            </div>
            <RepoLink href="https://github.com/06-month/Exercise3D-Dataset-Pipeline" />
          </div>
        </div>

        <div className="project-card project-card-featured flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Research</span>
              <span className="project-date mono">2026.06 - Present</span>
            </div>
            <div className="project-body">
              <h3>Feed-Forward 3D/4D Reconstruction Study</h3>
              <p>Independent literature study and research proposal on compact query-based and dynamic Gaussian reconstruction methods, including 3DGS, Deformable 3DGS, VGGT, C3G, and C4G.</p>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-tech flex flex-wrap gap-1.5">
              <span className="tech-badge">Feed-Forward Reconstruction</span>
              <span className="tech-badge">Dynamic Gaussians</span>
              <span className="tech-badge">Gaussian Splatting</span>
            </div>
          </div>
        </div>

        <div className="project-card project-card-compact flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Capstone</span>
              <span className="project-date mono">2026.03 - Present</span>
            </div>
            <div className="project-body">
              <h3>On-Device Human Pose Estimation</h3>
              <p>Capstone design AI pipeline for real-time exercise posture coaching with on-device pose estimation, joint-angle features, and model-based feedback logic.</p>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-tech flex flex-wrap gap-1.5">
              <span className="tech-badge">On-Device</span>
              <span className="tech-badge">Pose Estimation</span>
              <span className="tech-badge">Mobile AI</span>
            </div>
            <RepoLink href="https://github.com/06-month/BPT" />
          </div>
        </div>

        <div className="project-card project-card-compact flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Seminar</span>
              <span className="project-date mono">2026.01 - 2026.02</span>
            </div>
            <div className="project-body">
              <h3>Satellite Image Building Area Segmentation</h3>
              <p>AiRLab lab coding seminar project on semantic segmentation of building regions from satellite imagery using deep learning models.</p>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-tech flex flex-wrap gap-1.5">
              <span className="tech-badge">Semantic Seg</span>
              <span className="tech-badge">U-Net</span>
              <span className="tech-badge">Satellite Vision</span>
            </div>
            <RepoLink href="https://github.com/06-month/satellite-building-segmentation" />
          </div>
        </div>

        <div className="project-card project-card-compact flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Research</span>
              <span className="project-date mono">2025.10 - 2025.12</span>
            </div>
            <div className="project-body">
              <h3>CLIP2FL-based Federated Learning Research</h3>
              <p>Federated learning research on CLIP2FL with balanced knowledge distillation, resulting in a KICS Winter Conference 2026 publication.</p>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-tech flex flex-wrap gap-1.5">
              <span className="tech-badge">Federated Learning</span>
              <span className="tech-badge">CLIP</span>
              <span className="tech-badge">BKD</span>
            </div>
            <RepoLink href="https://github.com/06-month/CLIP2FL_BKD" />
          </div>
        </div>

        <div className="project-card project-card-compact flex flex-col justify-between">
          <div>
            <div className="project-meta flex justify-between items-center mb-4">
              <span className="tag-custom">Academic</span>
              <span className="project-date mono">2025.11 - 2025.12</span>
            </div>
            <div className="project-body">
              <h3>Satellite Cloud Semantic Segmentation</h3>
              <p>Computer vision term project on semantic segmentation of satellite images for thick cloud, thin cloud, and cloud shadow classes.</p>
            </div>
          </div>
          <div className="project-footer">
            <div className="project-tech flex flex-wrap gap-1.5">
              <span className="tech-badge">Computer Vision</span>
              <span className="tech-badge">Semantic Seg</span>
              <span className="tech-badge">Satellite</span>
            </div>
            <RepoLink href="https://github.com/06-month/Satellite-Cloud-Semantic-Segmentation" />
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
            <h4>Research Interests</h4>
            <div className="skills-list">
              <span className="skill-tag">Feed-Forward Reconstruction</span>
              <span className="skill-tag">3D/4D Scene Reconstruction</span>
              <span className="skill-tag">Dynamic Gaussian Representations</span>
              <span className="skill-tag">Motion Modeling</span>
              <span className="skill-tag">Efficient Neural Rendering</span>
            </div>
          </div>

          <div className="skills-category">
            <h4>Deep Learning &amp; Computer Vision</h4>
            <div className="skills-list">
              <span className="skill-tag">PyTorch</span>
              <span className="skill-tag">NumPy</span>
              <span className="skill-tag">OpenCV</span>
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
                <span className="text-zinc-400">Hanbat National University — &quot;Budgetly&quot; OCR finance app</span>
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
          <span className="mono" style={{ color: "var(--text-muted)", fontSize: "11px" }}>Last Updated: 2026.08.16</span>
        </div>
      </section>
    </div>
  );
}
