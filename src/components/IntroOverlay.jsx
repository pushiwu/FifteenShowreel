import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import MaskedHeading from "./MaskedHeading";
import "./IntroOverlay.css";

const INTRO_DURATION = 4.5;
const COMPACT_DURATION = 3.6;

export default function IntroOverlay({ onHandoffStart, onComplete }) {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef(null);
  const lockupRef = useRef(null);
  const labelRef = useRef(null);
  const ruleRef = useRef(null);
  const titleShellRef = useRef(null);
  const topCurtainRef = useRef(null);
  const bottomCurtainRef = useRef(null);
  const previousOverflowRef = useRef("");

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return undefined;

    const previousOverflow = document.body.style.overflow;
    previousOverflowRef.current = previousOverflow;
    document.body.style.overflow = "hidden";

    let completed = false;
    let timeline = null;
    let finishTimer = null;

    const finish = () => {
      if (completed) return;
      completed = true;
      document.body.style.overflow = previousOverflowRef.current;
      setVisible(false);
      onComplete?.();
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 700px)").matches;

    if (reducedMotion) {
      gsap.set([labelRef.current, ruleRef.current, titleShellRef.current], {
        autoAlpha: 1,
        clearProps: "transform,clipPath,filter",
      });
      timeline = gsap.timeline({ onComplete: finish });
      timeline
        .call(() => onHandoffStart?.(), null, 0.12)
        .to(topCurtainRef.current, { yPercent: -100, duration: 0.28, ease: "power2.inOut" }, 0.2)
        .to(bottomCurtainRef.current, { yPercent: 100, duration: 0.28, ease: "power2.inOut" }, 0.2)
        .set(overlay, { pointerEvents: "none" }, 0.48);
      finishTimer = window.setTimeout(finish, 900);
    } else {
      const totalDuration = compact ? COMPACT_DURATION : INTRO_DURATION;
      const handoffAt = compact ? 2.52 : 3.15;
      const exitDuration = totalDuration - handoffAt;
      timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: finish,
      });

      timeline
        .fromTo(
            labelRef.current,
            { autoAlpha: 0, y: compact ? 22 : 34, clipPath: "inset(100% 0 0 0)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: compact ? 0.72 : 0.92 },
            0.18,
        )
        .fromTo(
            ruleRef.current,
            { scaleX: 0, transformOrigin: "center" },
            { scaleX: 1, duration: compact ? 0.82 : 1.08, ease: "power3.inOut" },
            0.34,
        )
        .fromTo(
            titleShellRef.current,
            {
              autoAlpha: 0,
              y: compact ? 64 : 96,
              scaleX: 0.58,
              scaleY: 0.76,
              clipPath: "inset(100% 0 0 0)",
              filter: "blur(12px)",
              transformOrigin: "center bottom",
            },
            {
              autoAlpha: 1,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              clipPath: "inset(0% 0 0 0)",
              filter: "blur(0px)",
              duration: compact ? 1.12 : 1.45,
              ease: "expo.out",
            },
            compact ? 0.52 : 0.64,
        )
        .to(
            titleShellRef.current,
            {
              scale: compact ? 1.1 : 1.18,
              letterSpacing: "-0.075em",
              duration: compact ? 1.05 : 1.35,
              ease: "power3.inOut",
            },
            compact ? 1.62 : 1.92,
        )
        .call(() => onHandoffStart?.(), null, handoffAt)
        .to(
            lockupRef.current,
            {
              y: compact ? -26 : -46,
              autoAlpha: 0,
              duration: Math.min(0.72, exitDuration * 0.55),
              ease: "power3.in",
            },
            handoffAt,
        )
        .to(
            topCurtainRef.current,
            { yPercent: -102, duration: exitDuration, ease: "power3.inOut" },
            handoffAt,
        )
        .to(
            bottomCurtainRef.current,
            { yPercent: 102, duration: exitDuration, ease: "power3.inOut" },
            handoffAt,
        )
        .set(overlay, { pointerEvents: "none" }, totalDuration);

      // The opening must never leave the document locked if a browser pauses a GSAP callback.
      finishTimer = window.setTimeout(finish, (totalDuration + 0.75) * 1000);
    }

    return () => {
      timeline?.kill();
      if (finishTimer) window.clearTimeout(finishTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete, onHandoffStart]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className="intro-overlay" role="presentation">
      <div
        ref={topCurtainRef}
        className="intro-overlay__curtain intro-overlay__curtain--top"
        aria-hidden="true"
      />
      <div
        ref={bottomCurtainRef}
        className="intro-overlay__curtain intro-overlay__curtain--bottom"
        aria-hidden="true"
      />
      <div ref={lockupRef} className="intro-overlay__lockup">
        <div className="intro-overlay__credit">
          <span ref={ruleRef} className="intro-overlay__rule" aria-hidden="true" />
          <p ref={labelRef}>FIFTEEN / CINEMATOGRAPHY &amp; LIGHTING</p>
        </div>
        <div ref={titleShellRef} className="intro-overlay__title-shell">
          <MaskedHeading
            text="showreel"
            tag="h1"
            mediaType="video"
            src="/projects/showreel-intro.mp4"
            poster="/hero-showreel-poster.jpg"
            fillScale={1.32}
            parallax={14}
            drift={7}
            brightness={0.95}
            saturation={0.78}
            reveal="none"
            trigger="mount"
            align="center"
            weight={700}
            tracking={-0.05}
            lineHeight={0.92}
            textScale={0.18}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
