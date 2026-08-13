import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./SectionReveal.css";

gsap.registerPlugin(ScrollTrigger);

export default function SectionReveal({
  children,
  immediate = false,
  className = "",
}) {
  const rootRef = useRef(null);
  const surfaceRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const surface = surfaceRef.current;
    if (!root || !surface) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      gsap.set(surface, { clearProps: "all" });
      root.dataset.revealed = "true";
      return undefined;
    }

    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const context = gsap.context(() => {
      if (immediate) {
        gsap.fromTo(
          surface,
          {
            autoAlpha: 0,
            y: mobile ? 18 : 28,
            clipPath: "inset(0% 0% 8% 0% round 18px)",
          },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            duration: 1.45,
            ease: "power3.out",
            onComplete: () => {
              root.dataset.revealed = "true";
            },
          },
        );
        return;
      }

      const reveal = gsap.fromTo(
        surface,
        {
          autoAlpha: 0.12,
          y: mobile ? 34 : 72,
          scale: mobile ? 0.995 : 0.988,
          clipPath: mobile
            ? "inset(0% 0% 0% 0% round 0px)"
            : "inset(13% 1.2% 0% 1.2% round 24px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 94%",
            end: mobile ? "top 38%" : "top 28%",
            scrub: mobile ? 0.7 : 1.05,
            invalidateOnRefresh: true,
            onLeave: () => {
              root.dataset.revealed = "true";
            },
            onEnterBack: () => {
              root.dataset.revealed = "scrolling";
            },
          },
        },
      );

      const exitParallax = mobile
        ? null
        : gsap.fromTo(
            surface,
            { yPercent: 0 },
            {
              yPercent: -2.4,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "bottom 72%",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );

      root.dataset.revealed = "scrolling";

      return () => {
        reveal.kill();
        exitParallax?.kill();
      };
    }, root);

    return () => context.revert();
  }, [immediate]);

  return (
    <div
      ref={rootRef}
      className={`section-reveal ${className}`.trim()}
    >
      <div ref={surfaceRef} className="section-reveal__surface">
        {children}
      </div>
    </div>
  );
}
