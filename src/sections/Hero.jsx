import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Hero.css";

export default function Hero({ active = true, heroHandoff = false }) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let isInView = true;
    const syncPlayback = () => {
      if (active && isInView && !document.hidden) video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.08 },
    );
    const handleVisibilityChange = () => syncPlayback();
    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncPlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      video.pause();
    };
  }, [active]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const media = root.querySelector('[data-motion="hero-media"]');
      const title = root.querySelector('[data-motion="hero-title"]');
      const english = root.querySelector('[data-motion="hero-english"]');
      const support = root.querySelectorAll('[data-motion="hero-support"]');
      const meta = root.querySelectorAll('[data-motion="hero-meta"]');

      if (reducedMotion) {
        gsap.set([media, title, english, ...support, ...meta], { clearProps: "all" });
        return;
      }

      if (!heroHandoff) {
        gsap.set(media, { scale: 1.1, filter: "brightness(0.52) blur(8px)" });
        gsap.set(title, { autoAlpha: 0, yPercent: 118, scaleY: 0.55, transformOrigin: "bottom" });
        gsap.set(english, { autoAlpha: 0, y: 42, scale: 1.28, letterSpacing: "0.38em" });
        gsap.set([...support, ...meta], { autoAlpha: 0, y: 34 });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });
      timeline
        .to(media, { scale: 1, filter: "brightness(1) blur(0px)", duration: 1.8, ease: "power3.inOut" }, 0)
        .to(title, { autoAlpha: 1, yPercent: 0, scaleY: 1, duration: 1.55, ease: "expo.out" }, 0.18)
        .to(english, { autoAlpha: 1, y: 0, scale: 1, letterSpacing: "0.22em", duration: 1.42 }, 0.42)
        .to(support, { autoAlpha: 1, y: 0, duration: 1.05, stagger: 0.1 }, 0.72)
        .to(meta, { autoAlpha: 1, y: 0, duration: 1.08, stagger: 0.14 }, 0.9);
      return () => timeline.kill();
    }, root);
    return () => context.revert();
  }, [heroHandoff]);

  return (
    <section ref={rootRef} className={`hero ${heroHandoff ? "is-handoff" : "is-waiting"}`} id="home">
      <div className="hero-shell">
        <video
          key={active ? "hero-active" : "hero-idle"}
          ref={videoRef}
          data-motion="hero-media"
          className="hero-video"
          poster="/hero-showreel-poster.jpg"
          muted
          loop
          playsInline
          preload={active ? "metadata" : "none"}
          aria-hidden="true"
        >
          {active ? (
            <>
              <source
                src="/projects/showreel-mobile.mp4"
                media="(max-width: 700px)"
                type="video/mp4"
              />
              <source src="/projects/showreel-web.mp4" type="video/mp4" />
            </>
          ) : null}
        </video>
        <div className="hero-bg-layer" />
        <div className="hero-noise" />
        <div className="hero-light" />

        <div className="hero-meta-left">
          <p data-motion="hero-meta" className="hero-eyebrow">State before statement.</p>
        </div>

        <div className="hero-copy">
          <p data-motion="hero-support" className="hero-kicker">Fifteen Personal Portfolio</p>
          <div className="hero-title-mask">
            <h1 data-motion="hero-title" className="hero-title">蒲师武</h1>
          </div>
          <div className="hero-name-mask">
            <p data-motion="hero-english" className="hero-name-en">fifteen</p>
          </div>
          <div data-motion="hero-support" className="hero-role-block">
            <p className="hero-role-zh">摄影、灯光、掌机、第一摄影助理、数字影像工程师</p>
            <p className="hero-role-en">Cinematographer / Gaffer / Camera Operator / 1st AC / DIT</p>
          </div>
        </div>

        <div className="hero-meta-right">
          <p data-motion="hero-meta" className="hero-statement">
            当下的状态，先于陈述。状态一旦精准，故事便自由延展。
          </p>
        </div>
      </div>
    </section>
  );
}
