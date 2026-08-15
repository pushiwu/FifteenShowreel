import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import GlareHover from "../components/GlareHover";
import OrbitImages from "../components/OrbitImages";
import SectionMotion from "../components/SectionMotion";
import TextReveal from "../components/TextReveal";
import { projects } from "../data/projects";
import {
  canSwitchMouseDirection,
  getMouseDirectionStep,
  MOUSE_SWITCH_COOLDOWN,
} from "../utils/mouseDirection";
import {
  canSwitchWheelDirection,
  getWheelDirectionStep,
  normalizeWheelDelta,
  shouldCaptureProjectWheel,
  WHEEL_SWITCH_COOLDOWN,
} from "../utils/wheelDirection";
import {
  getOrbitDatasetKey,
  getSafeActiveIndex,
} from "../utils/orbitLayout";
import { shouldRunProjectAutoplay } from "../utils/animationPolicy";
import "./Projects.css";

const AUTOPLAY_DELAY = 4200;

const orbitLayouts = {
  core: {
    baseWidth: 1440,
    baseHeight: 900,
    radiusX: 520,
    radiusY: 160,
    itemWidth: 300,
    itemHeight: 420,
    compactBaseHeight: 700,
    compactRadiusX: 230,
    compactRadiusY: 120,
    compactItemWidth: 220,
    compactItemHeight: 320,
  },
  extended: {
    baseWidth: 1440,
    baseHeight: 920,
    radiusX: 540,
    radiusY: 170,
    itemWidth: 250,
    itemHeight: 360,
    compactBaseHeight: 700,
    compactRadiusX: 245,
    compactRadiusY: 125,
    compactItemWidth: 200,
    compactItemHeight: 300,
  },
  all: {
    baseWidth: 1440,
    baseHeight: 900,
    radiusX: 610,
    radiusY: 240,
    itemWidth: 190,
    itemHeight: 270,
    compactBaseHeight: 700,
    compactRadiusX: 290,
    compactRadiusY: 165,
    compactItemWidth: 220,
    compactItemHeight: 320,
  },
};

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
      src={project.thumbnail ?? project.poster ?? project.image}
      alt={project.title}
      loading="lazy"
    />
  );
}

export default function Projects() {
  const [viewMode, setViewMode] = useState("core");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openedProjectId, setOpenedProjectId] = useState(null);
  const [videoSegmentIndex, setVideoSegmentIndex] = useState(0);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => !document.hidden
  );
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const lastMouseXRef = useRef(null);
  const lastMouseSwitchAtRef = useRef(null);
  const mouseGestureLockedRef = useRef(false);
  const mouseGestureTimerRef = useRef(null);
  const wheelDeltaRef = useRef(0);
  const wheelResetTimerRef = useRef(null);
  const lastWheelSwitchAtRef = useRef(null);
  const projectsCurveRef = useRef(null);
  const projectsSectionRef = useRef(null);
  const modalVideoRef = useRef(null);

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
  const orbitLayout = orbitLayouts[viewMode];
  const safeActiveIndex = getSafeActiveIndex(
    activeIndex,
    visibleProjects.length,
  );

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
    const section = projectsSectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionInView(entry.isIntersecting),
      { rootMargin: "0px", threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const handleChange = (event) => setIsCompactViewport(event.matches);

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => setPrefersReducedMotion(event.matches);

    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    if (!shouldRunProjectAutoplay({
      isPaused,
      isDocumentVisible,
      isSectionInView,
      isCompactAllView: viewMode === "all" && isCompactViewport,
      itemCount: visibleProjects.length,
      isModalOpen: openedProjectId !== null,
      prefersReducedMotion,
    })) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (getSafeActiveIndex(current, visibleProjects.length) + 1) %
          visibleProjects.length,
      );
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [
    isDocumentVisible,
    isSectionInView,
    isCompactViewport,
    isPaused,
    openedProjectId,
    prefersReducedMotion,
    viewMode,
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

  useEffect(() => {
    setVideoSegmentIndex(0);
  }, [openedProjectId]);

  useEffect(() => {
    if (videoSegmentIndex > 0) {
      modalVideoRef.current?.play().catch(() => {});
    }
  }, [videoSegmentIndex]);

  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video) return undefined;

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [openedProjectId, videoSegmentIndex]);

  useEffect(
    () => () => {
      if (mouseGestureTimerRef.current !== null) {
        window.clearTimeout(mouseGestureTimerRef.current);
      }
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
    },
    [],
  );

  const activeProject = useMemo(
    () => visibleProjects[safeActiveIndex] ?? visibleProjects[0] ?? projects[0],
    [safeActiveIndex, visibleProjects]
  );

  const openedProject = useMemo(
    () => projects.find((project) => project.id === openedProjectId) ?? null,
    [openedProjectId]
  );
  const openedVideoSegments = openedProject?.videoSegments ??
    (openedProject?.video ? [openedProject.video] : []);

  const handleProjectClick = (project, index) => {
    setActiveIndex(index);
    setOpenedProjectId(project.id);
  };

  const handleViewModeChange = (nextViewMode) => {
    if (nextViewMode === viewMode) return;
    setActiveIndex(0);
    setViewMode(nextViewMode);
  };

  const handleStageMouseEnter = () => {
    setIsPaused(true);
    lastMouseXRef.current = null;
    lastMouseSwitchAtRef.current = null;
    mouseGestureLockedRef.current = false;
  };

  const handleStageMouseLeave = () => {
    setIsPaused(false);
    lastMouseXRef.current = null;
    lastMouseSwitchAtRef.current = null;
    mouseGestureLockedRef.current = false;
    if (mouseGestureTimerRef.current !== null) {
      window.clearTimeout(mouseGestureTimerRef.current);
      mouseGestureTimerRef.current = null;
    }
    wheelDeltaRef.current = 0;
    lastWheelSwitchAtRef.current = null;
  };

  const handleProjectsMouseMove = (event) => {
    if (
      visibleProjects.length <= 1 ||
      openedProjectId !== null ||
      (viewMode === "all" && isCompactViewport)
    ) {
      return;
    }

    const currentMouseX = event.clientX;
    if (mouseGestureTimerRef.current !== null) {
      window.clearTimeout(mouseGestureTimerRef.current);
    }
    mouseGestureTimerRef.current = window.setTimeout(() => {
      mouseGestureLockedRef.current = false;
      lastMouseXRef.current = null;
      mouseGestureTimerRef.current = null;
    }, 180);

    if (lastMouseXRef.current === null) {
      lastMouseXRef.current = currentMouseX;
      return;
    }

    const deltaX = currentMouseX - lastMouseXRef.current;
    const directionStep = getMouseDirectionStep(deltaX);

    if (directionStep === 0) return;

    if (mouseGestureLockedRef.current) {
      lastMouseXRef.current = currentMouseX;
      return;
    }

    const now = performance.now();
    const elapsedMs =
      lastMouseSwitchAtRef.current === null
        ? MOUSE_SWITCH_COOLDOWN
        : now - lastMouseSwitchAtRef.current;

    if (!canSwitchMouseDirection(deltaX, elapsedMs)) return;

    lastMouseXRef.current = currentMouseX;
    lastMouseSwitchAtRef.current = now;
    mouseGestureLockedRef.current = true;
    setActiveIndex(
      (current) =>
        (getSafeActiveIndex(current, visibleProjects.length) +
          directionStep +
          visibleProjects.length) %
        visibleProjects.length
    );
  };

  const handleProjectsWheel = useEffectEvent((event) => {
    const isGridLayout = viewMode === "all" && isCompactViewport;
    if (
      !shouldCaptureProjectWheel({
        itemCount: visibleProjects.length,
        isModalOpen: openedProjectId !== null,
        isGridLayout,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
      })
    ) {
      return;
    }

    event.preventDefault();

    const rawDelta =
      Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;
    wheelDeltaRef.current += normalizeWheelDelta(
      rawDelta,
      event.deltaMode,
      window.innerHeight,
    );

    if (wheelResetTimerRef.current !== null) {
      window.clearTimeout(wheelResetTimerRef.current);
    }
    wheelResetTimerRef.current = window.setTimeout(() => {
      wheelDeltaRef.current = 0;
      wheelResetTimerRef.current = null;
    }, 180);

    const now = performance.now();
    const elapsedMs =
      lastWheelSwitchAtRef.current === null
        ? WHEEL_SWITCH_COOLDOWN
        : now - lastWheelSwitchAtRef.current;

    if (!canSwitchWheelDirection(wheelDeltaRef.current, elapsedMs)) return;

    const directionStep = getWheelDirectionStep(wheelDeltaRef.current);
    wheelDeltaRef.current = 0;
    lastWheelSwitchAtRef.current = now;
    setActiveIndex(
      (current) =>
        (getSafeActiveIndex(current, visibleProjects.length) +
          directionStep +
          visibleProjects.length) %
        visibleProjects.length,
    );
  });

  useEffect(() => {
    const curve = projectsCurveRef.current;
    if (!curve) return undefined;

    const handleWheel = (event) => handleProjectsWheel(event);
    curve.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      curve.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <SectionMotion start="top 76%">
      <section ref={projectsSectionRef} className="projects" id="projects">
      <div className="container">
        <div
          className="projects-stage"
          onMouseEnter={handleStageMouseEnter}
          onMouseLeave={handleStageMouseLeave}
        >
          <div data-motion="meta" className="projects-view-switcher" role="tablist" aria-label="Project categories">
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
                onClick={() => handleViewModeChange(option.value)}
              >
                <span>{option.label}</span>
                <small>{option.en}</small>
              </button>
            ))}
          </div>

          <div
            ref={projectsCurveRef}
            data-motion="media"
            data-motion-scope="projects-orbit"
            className="projects-curve"
            aria-label="Past works carousel"
            onMouseMove={handleProjectsMouseMove}
          >
            <OrbitImages
              key={getOrbitDatasetKey(viewMode, visibleProjects)}
              items={visibleProjects}
              activeIndex={safeActiveIndex}
              className={`projects-orbit projects-orbit--${viewMode}`}
              baseWidth={orbitLayout.baseWidth}
              baseHeight={orbitLayout.baseHeight}
              radiusX={orbitLayout.radiusX}
              radiusY={orbitLayout.radiusY}
              rotation={-4}
              itemWidth={orbitLayout.itemWidth}
              itemHeight={orbitLayout.itemHeight}
              activeOffset={25}
              compactActiveOffset={25}
              compactBaseHeight={orbitLayout.compactBaseHeight}
              compactRadiusX={orbitLayout.compactRadiusX}
              compactRadiusY={orbitLayout.compactRadiusY}
              compactItemWidth={orbitLayout.compactItemWidth}
              compactItemHeight={orbitLayout.compactItemHeight}
              transitionDuration={0.95}
              compactLayout={viewMode === "all" ? "grid" : "orbit"}
              responsive
              renderItem={(project, index, { isActive, isVisible }) => (
                <GlareHover
                  as="button"
                  key={project.id}
                  type="button"
                  className={`projects-orbit-item ${isActive ? "is-active" : ""} ${
                    project.video || project.videoSegments?.length ? "is-playable" : ""
                  }`}
                  onClick={() => handleProjectClick(project, index)}
                  aria-pressed={isActive}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${project.title} / ${project.titleEn}`}
                  tabIndex={isVisible ? 0 : -1}
                  width="100%"
                  height="100%"
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
                    {isActive ? (
                      <span className="projects-orbit-current">
                        Current / {"\u5f53\u524d"}
                      </span>
                    ) : null}
                    {project.video || project.videoSegments?.length ? (
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
              )}
            />
          </div>

          <div className="projects-stage-copy">
            <p data-motion="title" className="motion-display-title projects-stage-display">
              SELECTED WORKS
            </p>
            <h2 data-motion="heading" className="section-title projects-stage-title">
              {"\u4f5c\u54c1"}
            </h2>
            <p data-motion="copy" className="projects-stage-subtitle">
              Selected works / Image, light, space and the state between them
            </p>
          </div>

          <div data-motion="copy" data-motion-scope="projects-detail" className="projects-stage-detail" aria-live="polite">
            <p className="projects-stage-detail-count">
              <span>Current / {"\u5f53\u524d"}</span>
              <span>{`${String(safeActiveIndex + 1).padStart(2, "0")} / ${String(visibleProjects.length).padStart(2, "0")}`}</span>
            </p>

            <div className="projects-stage-detail-main">
              <h3 className="projects-stage-detail-title">
                {activeProject.title}
              </h3>
              <p className="projects-stage-detail-title-en">
                {activeProject.titleEn}
              </p>
            </div>

            <div className="projects-stage-detail-meta">
              <p>
                <span>Role / {"\u5c97\u4f4d"}</span>
                {`${activeProject.role} / ${activeProject.roleEn}`}
              </p>
              <p>
                <span>Institution / {"\u9879\u76ee\u6765\u6e90"}</span>
                {`${activeProject.institution} / ${activeProject.institutionEn}`}
              </p>
              <p>
                <span>Format / {"\u7c7b\u578b"}</span>
                {`${activeProject.format} / ${activeProject.formatEn}`}
              </p>
              {activeProject.note ? (
                <p className="projects-stage-detail-note">
                  {activeProject.note}
                  {activeProject.noteEn ? (
                    <span className="projects-stage-detail-note-en">
                      {activeProject.noteEn}
                    </span>
                  ) : null}
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
            <div data-motion="cards" className="projects-text-only-list">
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
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                          />
                          <figcaption>
                            {String(index + 1).padStart(2, "0")}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : openedVideoSegments.length ? (
                    <video
                      ref={modalVideoRef}
                      key={`${openedProject.id}-${videoSegmentIndex}`}
                      className="projects-modal-video"
                      src={openedVideoSegments[videoSegmentIndex]}
                      poster={openedProject.poster ?? openedProject.image}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      onEnded={() => {
                        if (videoSegmentIndex < openedVideoSegments.length - 1) {
                          setVideoSegmentIndex((current) => current + 1);
                        }
                      }}
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
                    {openedProject.note ? (
                      <div className="projects-modal-statement">
                        <p>{openedProject.note}</p>
                        {openedProject.noteEn ? <p>{openedProject.noteEn}</p> : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="projects-modal-meta">
                    <p>
                      <span>Role / {"\u5c97\u4f4d"}</span>
                      {openedProject.role}
                      <br />
                      {openedProject.roleEn}
                    </p>
                    <p>
                      <span>Production / {"\u9879\u76ee\u6765\u6e90"}</span>
                      {openedProject.institution}
                      <br />
                      {openedProject.institutionEn}
                    </p>
                    {openedProject.format || openedProject.formatEn ? (
                      <p>
                        <span>Format / {"\u7c7b\u578b"}</span>
                        {openedProject.format}
                        <br />
                        {openedProject.formatEn}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
      </section>
    </SectionMotion>
  );
}
