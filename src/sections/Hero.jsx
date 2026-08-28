import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./Hero.css";

export default function Hero({ active = true, heroHandoff = false }) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const isVideoInViewRef = useRef(true);
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 700px)").matches,
  );
  const heroVideoSrc = isMobileViewport
    ? "/projects/showreel-mobile.mp4"
    : "/projects/showreel-web.mp4";

  const syncHeroPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || !isVideoInViewRef.current || document.hidden) {
      video.pause();
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const playback = video.play();
    playback?.catch(() => {});
  }, [active]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const handleChange = (event) => setIsMobileViewport(event.matches);
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVideoInViewRef.current = entry.isIntersecting;
        syncHeroPlayback();
      },
      { threshold: 0.08 },
    );
    const handleVisibilityChange = () => syncHeroPlayback();
    const handlePageShow = () => syncHeroPlayback();
    const handleFirstTouch = () => syncHeroPlayback();
    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("touchstart", handleFirstTouch, { passive: true });
    window.addEventListener("pointerdown", handleFirstTouch, { passive: true });
    syncHeroPlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("touchstart", handleFirstTouch);
      window.removeEventListener("pointerdown", handleFirstTouch);
      video.pause();
    };
  }, [syncHeroPlayback]);

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
          src={active ? heroVideoSrc : undefined}
          poster="/hero-showreel-poster.jpg"
          autoPlay={active}
          muted
          loop
          playsInline
          preload={active ? "auto" : "none"}
          onLoadedMetadata={syncHeroPlayback}
          onCanPlay={syncHeroPlayback}
          onLoadedData={syncHeroPlayback}
          aria-hidden="true"
        />
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
            <p className="hero-role-zh">摄影指导 / Director of Photography</p>
            <p className="hero-role-detail">同时具备灯光、掌机、第一摄影助理、数字影像工程师（DIT）完整现场工作能力。</p>
          </div>
        </div>

        <div className="hero-meta-right">
          <p data-motion="hero-meta" className="hero-statement">
            <span className="hero-statement-zh">当下的状态，先于陈述。状态一旦精准，故事便自由延展。</span>
            <span className="hero-statement-en">State comes before statement. When it is precise, the story can unfold freely.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
