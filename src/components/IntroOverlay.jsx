import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import MaskedHeading from "./MaskedHeading";
import "./IntroOverlay.css";

const INTRO_VISIBLE_MS = 3050;
const INTRO_FADE_MS = 1400;

export default function IntroOverlay({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef(null);
  const labelRef = useRef(null);
  const ruleRef = useRef(null);
  const previousOverflowRef = useRef("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    previousOverflowRef.current = previousOverflow;
    document.body.style.overflow = "hidden";

    const overlay = overlayRef.current;
    if (!overlay) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fadeDuration = reducedMotion ? 0.25 : INTRO_FADE_MS / 1000;
    const visibleDuration = reducedMotion ? 120 : INTRO_VISIBLE_MS;

    const introTimeline = gsap.timeline();
    if (!reducedMotion) {
      introTimeline
        .fromTo(
          labelRef.current,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out" },
          0.18,
        )
        .fromTo(
          ruleRef.current,
          { scaleX: 0, transformOrigin: "center" },
          { scaleX: 1, duration: 1.1, ease: "power3.inOut" },
          0.42,
        );
    }

    const timer = window.setTimeout(() => {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: fadeDuration,
        ease: "power2.inOut",
        onComplete: () => {
          document.body.style.overflow = previousOverflowRef.current;
          setVisible(false);
          onComplete?.();
        },
      });
    }, visibleDuration);

    return () => {
      window.clearTimeout(timer);
      introTimeline.kill();
      gsap.killTweensOf(overlay);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className="intro-overlay" role="presentation">
      <div className="intro-overlay__lockup">
        <div className="intro-overlay__credit">
          <span ref={ruleRef} className="intro-overlay__rule" aria-hidden="true" />
          <p ref={labelRef}>FIFTEEN / CINEMATOGRAPHY &amp; LIGHTING</p>
        </div>
        <MaskedHeading
          text="showreel"
          tag="h1"
          mediaType="video"
          src="/projects/showreel.mp4"
          poster="/hero-showreel-poster.jpg"
          fillScale={1.32}
          parallax={22}
          drift={10}
          brightness={0.95}
          saturation={0.85}
          reveal="rise"
          trigger="mount"
          duration={1.35}
          delay={0.58}
          stagger={0.08}
          align="center"
          weight={700}
          tracking={-0.05}
          lineHeight={0.92}
          textScale={0.18}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
