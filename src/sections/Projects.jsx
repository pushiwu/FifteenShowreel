import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import GlareHover from "../components/GlareHover";
import TextReveal from "../components/TextReveal";
import { projects } from "../data/projects";
import {
  canSwitchMouseDirection,
  getMouseDirectionStep,
  MOUSE_SWITCH_COOLDOWN,
} from "../utils/mouseDirection";
import "./Projects.css";

const AUTOPLAY_DELAY = 2000;
const VISIBLE_RADIUS = 4;

function ProjectThumbnail({ project }) {
  if (!project.poster && !project.image) {
    return (
      <span className="projects-orbit-image projects-orbit-image-fallback">
        <span>{project.titleEn}</span>
      </span>
    );
  }

  return (
    <img
      className="projects-orbit-image"
      src={project.poster ?? project.image}
      alt={project.title}
      loading="lazy"
    />
  );
}

function getCircularOffset(index, activeIndex, total) {
  const raw = index - activeIndex;
  const wrapped = ((raw + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);
  return wrapped;
}

export default function Projects() {
  const [viewMode, setViewMode] = useState("core");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openedProjectId, setOpenedProjectId] = useState(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => !document.hidden
  );
  const lastMouseXRef = useRef(null);
  const lastMouseSwitchAtRef = useRef(null);

  const visibleProjects = useMemo(() => {
    if (viewMode === "all") {
      return projects.filter((project) => !project.textOnly);
    }
    return projects.filter((project) => project.layer === viewMode && !project.textOnly);
  }, [viewMode]);

  const textOnlyProjects = useMemo(
    () => projects.filter((project) => project.textOnly),
    []
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [viewMode]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (
      isPaused ||
      !isDocumentVisible ||
      visibleProjects.length <= 1 ||
      openedProjectId !== null
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleProjects.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [
    isDocumentVisible,
    isPaused,
    openedProjectId,
    visibleProjects.length,
  ]);

  useEffect(() => {
    if (openedProjectId === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setOpenedProjectId(null);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openedProjectId]);

  const activeProject = useMemo(
    () => visibleProjects[activeIndex] ?? visibleProjects[0] ?? projects[0],
    [activeIndex, visibleProjects]
  );

  const openedProject = useMemo(
    () => projects.find((project) => project.id === openedProjectId) ?? null,
    [openedProjectId]
  );

  const handleProjectClick = (project, index) => {
    setActiveIndex(index);
    setOpenedProjectId(project.id);
  };

  const handleStageMouseEnter = () => {
    setIsPaused(true);
    lastMouseXRef.current = null;
    lastMouseSwitchAtRef.current = null;
  };

  const handleStageMouseLeave = () => {
    setIsPaused(false);
    lastMouseXRef.current = null;
    lastMouseSwitchAtRef.current = null;
  };

  const handleProjectsMouseMove = (event) => {
    if (visibleProjects.length <= 1 || openedProjectId !== null) return;

    const currentMouseX = event.clientX;
    if (lastMouseXRef.current === null) {
      lastMouseXRef.current = currentMouseX;
      return;
    }

    const deltaX = currentMouseX - lastMouseXRef.current;
    const directionStep = getMouseDirectionStep(deltaX);

    if (directionStep === 0) return;

    const now = performance.now();
    const elapsedMs =
      lastMouseSwitchAtRef.current === null
        ? MOUSE_SWITCH_COOLDOWN
        : now - lastMouseSwitchAtRef.current;

    if (!canSwitchMouseDirection(deltaX, elapsedMs)) return;

    lastMouseXRef.current = currentMouseX;
    lastMouseSwitchAtRef.current = now;
    setActiveIndex(
      (current) =>
        (current + directionStep + visibleProjects.length) %
        visibleProjects.length
    );
  };

  return (
    <section className="projects" id="projects">
      <div className="container">
        <div
          className="projects-stage"
          onMouseEnter={handleStageMouseEnter}
          onMouseLeave={handleStageMouseLeave}
        >
          <div className="projects-stage-copy">
            <p className="section-label projects-stage-label">
              <TextReveal text="Selected Works / \u7cbe\u9009\u4f5c\u54c1" animateOn="view" speed={18} />
            </p>
            <h2 className="section-title projects-stage-title">
              <TextReveal text={"\u4f5c\u54c1"} animateOn="view" speed={16} />
            </h2>
            <p className="projects-stage-subtitle">
              <TextReveal
                text="Selected works / Image, light, space and the state between them"
                animateOn="view"
                sequential={false}
                speed={12}
              />
            </p>
          </div>

          <div className="projects-view-switcher" role="tablist" aria-label="Project categories">
            {[
              { value: "core", label: "\u6838\u5fc3\u4f5c\u54c1", en: "Core" },
              { value: "extended", label: "\u5ef6\u5c55\u9879\u76ee", en: "Extended" },
              { value: "all", label: "\u5168\u90e8\u9879\u76ee", en: "All" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={viewMode === option.value}
                className={`projects-view-tab ${viewMode === option.value ? "is-active" : ""}`}
                onClick={() => setViewMode(option.value)}
              >
                <span>{option.label}</span>
                <small>{option.en}</small>
              </button>
            ))}
          </div>

          <div
            className="projects-curve"
            aria-label="Past works carousel"
            onMouseMove={handleProjectsMouseMove}
          >
            {visibleProjects.map((project, index) => {
              const offset = getCircularOffset(index, activeIndex, visibleProjects.length);
              const distance = Math.abs(offset);
              const isVisible = distance <= VISIBLE_RADIUS;
              const direction = offset === 0 ? 0 : offset > 0 ? 1 : -1;

              const x = offset * 240;
              const y = distance * distance * 34 + distance * 8;
              const scale = Math.max(0.52, 1 - distance * 0.11);
              const opacity = Math.max(0, 1 - distance * 0.18);
              const rotate = direction * Math.min(24, 8 + distance * 4);
              const width = Math.max(168, 330 - distance * 22);
              const isActive = offset === 0;

              return (
                <GlareHover
                  as="button"
                  key={project.id}
                  type="button"
                  className={`projects-orbit-item ${isActive ? "is-active" : ""} ${
                    project.video ? "is-playable" : ""
                  }`}
                  onClick={() => handleProjectClick(project, index)}
                  aria-pressed={isActive}
                  aria-label={`${project.title} / ${project.titleEn}`}
                  style={{
                    "--orbit-x": `${x}px`,
                    "--orbit-y": `${y}px`,
                    "--orbit-scale": scale,
                    "--orbit-rotate": `${rotate}deg`,
                    "--orbit-opacity": opacity,
                    "--orbit-z": String(100 - distance),
                    "--orbit-width": `${width}px`,
                    display: isVisible ? "block" : "none",
                  }}
                  width="var(--orbit-width)"
                  height="auto"
                  background="transparent"
                  borderRadius="4px"
                  borderColor="transparent"
                  glareColor="#d7dbda"
                  glareOpacity={isActive ? 0.22 : 0.14}
                  glareAngle={-30}
                  glareSize={290}
                  transitionDuration={850}
                >
                  <span className="projects-orbit-image-wrap">
                    <ProjectThumbnail project={project} />
                    <span className="projects-orbit-shade" />
                    {project.video ? (
                      <span className="projects-orbit-play">
                        <span className="projects-orbit-play-icon" />
                        <span className="projects-orbit-play-copy">
                          Play / {"\u64ad\u653e"}
                        </span>
                      </span>
                    ) : null}
                  </span>

                  <span className="projects-orbit-meta">
                    <span className="projects-orbit-index">
                      <TextReveal
                        text={String(index + 1).padStart(2, "0")}
                        animateOn="hover"
                        sequential={false}
                        speed={14}
                      />
                    </span>
                    <span className="projects-orbit-title">
                      <TextReveal text={project.title} animateOn="hover" speed={14} />
                    </span>
                    <span className="projects-orbit-title-en">
                      <TextReveal
                        text={project.titleEn}
                        animateOn="hover"
                        sequential={false}
                        speed={12}
                      />
                    </span>
                  </span>
                </GlareHover>
              );
            })}
          </div>

          <div className="projects-stage-detail" aria-live="polite">
            <p className="projects-stage-detail-count">
              <TextReveal
                text={`${String(activeIndex + 1).padStart(2, "0")} / ${String(visibleProjects.length).padStart(2, "0")}`}
                animateOn="view"
                sequential={false}
                speed={14}
              />
            </p>

            <div className="projects-stage-detail-main">
              <h3 className="projects-stage-detail-title">
                <TextReveal text={activeProject.title} animateOn="view" speed={16} />
              </h3>
              <p className="projects-stage-detail-title-en">
                <TextReveal
                  text={activeProject.titleEn}
                  animateOn="view"
                  sequential={false}
                  speed={13}
                />
              </p>
            </div>

            <div className="projects-stage-detail-meta">
              <p>
                <span>Role / {"\u5c97\u4f4d"}</span>
                <TextReveal
                  text={`${activeProject.role} / ${activeProject.roleEn}`}
                  animateOn="view"
                  sequential={false}
                  speed={11}
                />
              </p>
              <p>
                <span>Institution / {"\u9879\u76ee\u6765\u6e90"}</span>
                <TextReveal
                  text={`${activeProject.institution} / ${activeProject.institutionEn}`}
                  animateOn="view"
                  sequential={false}
                  speed={11}
                />
              </p>
              <p>
                <span>Format / {"\u7c7b\u578b"}</span>
                <TextReveal
                  text={`${activeProject.format} / ${activeProject.formatEn}`}
                  animateOn="view"
                  sequential={false}
                  speed={11}
                />
              </p>
              {activeProject.note ? (
                <p className="projects-stage-detail-note">
                  <TextReveal text={activeProject.note} animateOn="view" speed={9} />
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {viewMode === "all" ? (
          <section className="projects-text-only" aria-label="Text-only projects">
            <div className="projects-text-only-heading">
              <p className="section-label">Text-only records / 文字履历</p>
              <p className="projects-text-only-intro">
                Projects without available media
              </p>
            </div>
            <div className="projects-text-only-list">
              {textOnlyProjects.map((project, index) => (
                <GlareHover
                  as="button"
                  key={project.id}
                  type="button"
                  className="projects-text-only-item"
                  onClick={() => setOpenedProjectId(project.id)}
                  aria-label={`${project.title} / ${project.titleEn}`}
                  width="100%"
                  height="auto"
                  background="transparent"
                  borderRadius="0px"
                  borderColor="transparent"
                  glareColor="#d9d9d9"
                  glareOpacity={0.13}
                  glareAngle={-28}
                  glareSize={250}
                  transitionDuration={900}
                >
                  <span className="projects-text-only-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="projects-text-only-copy">
                    <strong>{project.title}</strong>
                    <small>{project.titleEn}</small>
                  </span>
                  <span className="projects-text-only-meta">
                    <span>{project.role}</span>
                    <span>{project.institution}</span>
                  </span>
                  <span className="projects-text-only-arrow" aria-hidden="true">
                    &gt;
                  </span>
                </GlareHover>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {openedProject
        ? createPortal(
            <div
              className="projects-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`${openedProject.title} project detail`}
              onClick={() => setOpenedProjectId(null)}
            >
              <div
                className="projects-modal-panel"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="projects-modal-close"
                  onClick={() => setOpenedProjectId(null)}
                  aria-label="Back and close project player"
                >
                  <span aria-hidden="true">←</span>
                  Back / {"\u8fd4\u56de"}
                </button>

                <div className="projects-modal-media">
                  {openedProject.galleryImages ? (
                    <div className="projects-modal-gallery">
                      {openedProject.galleryImages.map((image, index) => (
                        <figure
                          className={`projects-modal-gallery-item item-${index + 1}`}
                          key={image}
                        >
                          <img
                            src={image}
                            alt={`${openedProject.title} still ${index + 1}`}
                            loading={index < 3 ? "eager" : "lazy"}
                          />
                          <figcaption>
                            {String(index + 1).padStart(2, "0")}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : openedProject.video ? (
                    <video
                      className="projects-modal-video"
                      src={openedProject.video}
                      poster={openedProject.poster ?? openedProject.image}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  ) : openedProject.image ? (
                    <img
                      className="projects-modal-image"
                      src={openedProject.image}
                      alt={openedProject.title}
                    />
                  ) : (
                    <div className="projects-modal-empty">
                      <span>Project still / \u9879\u76ee\u9759\u5e27</span>
                    </div>
                  )}
                </div>

                <div className="projects-modal-info">
                  <div>
                    <p className="projects-modal-label">
                      Title / {"\u9879\u76ee\u540d\u79f0"}
                    </p>
                    <h3 className="projects-modal-title">{openedProject.title}</h3>
                    <p className="projects-modal-title-en">{openedProject.titleEn}</p>
                  </div>

                  <div className="projects-modal-meta">
                    <p>
                      <span>Role / {"\u5c97\u4f4d"}</span>
                      {openedProject.role}
                      <br />
                      {openedProject.roleEn}
                    </p>
                    <p>
                      <span>Institution / {"\u5b66\u6821"}</span>
                      {openedProject.institution}
                      <br />
                      {openedProject.institutionEn}
                    </p>
                    <p>
                      <span>Format / {"\u7c7b\u578b"}</span>
                      {openedProject.format}
                      <br />
                      {openedProject.formatEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
