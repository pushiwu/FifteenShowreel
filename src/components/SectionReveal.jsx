import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import "./SectionReveal.css";

const variants = {
  hero: {
    from: { autoAlpha: 0, y: 26, scale: 0.992 },
    to: { autoAlpha: 1, y: 0, scale: 1, duration: 1.45 },
  },
  rise: {
    from: { autoAlpha: 0, y: 54 },
    to: { autoAlpha: 1, y: 0, duration: 1.2 },
  },
  wipe: {
    from: { autoAlpha: 0, y: 34, clipPath: "inset(0% 0% 14% 0%)" },
    to: {
      autoAlpha: 1,
      y: 0,
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.35,
    },
  },
  settle: {
    from: { autoAlpha: 0, y: 38, scale: 0.997 },
    to: { autoAlpha: 1, y: 0, scale: 1, duration: 1.25 },
  },
};

export default function SectionReveal({
  children,
  variant = "rise",
  immediate = false,
  className = "",
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      gsap.set(root, { clearProps: "all" });
      root.dataset.revealed = "true";
      return undefined;
    }

    const config = variants[variant] ?? variants.rise;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const from = { ...config.from };
    if (mobile && typeof from.y === "number") from.y *= 0.55;

    gsap.set(root, from);

    const reveal = () => {
      if (
        root.dataset.revealed === "true" ||
        root.dataset.revealed === "animating"
      ) {
        return;
      }

      root.dataset.revealed = "animating";
      gsap.to(root, {
        ...config.to,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,clipPath",
        onComplete: () => {
          root.dataset.revealed = "true";
        },
      });
    };

    const stopIncompleteReveal = () => {
      gsap.killTweensOf(root);
      if (root.dataset.revealed === "animating") {
        delete root.dataset.revealed;
      }
    };

    if (immediate) {
      const frame = requestAnimationFrame(reveal);
      return () => {
        cancelAnimationFrame(frame);
        stopIncompleteReveal();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      stopIncompleteReveal();
    };
  }, [immediate, variant]);

  return (
    <div
      ref={rootRef}
      className={`section-reveal section-reveal--${variant} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
