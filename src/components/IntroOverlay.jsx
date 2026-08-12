import { useEffect, useState } from "react";
import { gsap } from "gsap";

import MaskedHeading from "./MaskedHeading";
import "./IntroOverlay.css";

const INTRO_VISIBLE_MS = 1750;
const INTRO_FADE_MS = 850;

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const overlay = document.querySelector(".intro-overlay");
    if (!overlay) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fadeDuration = reducedMotion ? 0.2 : INTRO_FADE_MS / 1000;
    const visibleDuration = reducedMotion ? 120 : INTRO_VISIBLE_MS;

    const timer = window.setTimeout(() => {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: fadeDuration,
        ease: "power2.inOut",
        onComplete: () => setVisible(false),
      });
    }, visibleDuration);

    return () => {
      window.clearTimeout(timer);
      gsap.killTweensOf(overlay);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="intro-overlay" role="presentation">
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
        duration={1.1}
        stagger={0.08}
        align="center"
        weight={700}
        tracking={-0.05}
        lineHeight={0.92}
        textScale={0.18}
        aria-hidden="true"
      />
    </div>
  );
}
