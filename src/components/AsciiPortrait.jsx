import { useEffect, useMemo, useRef, useState } from "react";
import {
  CUSTOM_ASCII_DEFAULTS,
  getPortraitFrameInterval,
  normalizeAsciiConfig,
  shouldRunPortraitAnimation,
} from "../utils/asciiPortrait";
import { createPortraitRenderer } from "./asciiPortraitRenderer";

import "./AsciiPortrait.css";

export default function AsciiPortrait({
  src,
  alt = "",
  className = "",
  imageClassName = "",
  config = CUSTOM_ASCII_DEFAULTS,
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const configKey = JSON.stringify(config);
  const normalizedConfig = useMemo(
    () => normalizeAsciiConfig(config),
    // Config is a serializable visual recipe; the stable key avoids rebuilds for equal objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configKey],
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas || !src) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const renderer = createPortraitRenderer();
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrameAt = 0;
    let isInViewport = false;
    let isDocumentVisible = !document.hidden;
    let prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let hasRendered = false;
    let disposed = false;
    let rebuildSequence = 0;
    let lastBuiltWidth = 0;
    let lastBuiltHeight = 0;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const drawFrame = (time = 0) => {
      if (!width || !height || disposed) return;
      const rendered = renderer.draw(
        context,
        normalizedConfig,
        prefersReducedMotion ? 0 : time,
      );
      if (rendered && !hasRendered) {
        hasRendered = true;
        setReady(true);
      }
    };

    const canAnimate = () => normalizedConfig.animated && shouldRunPortraitAnimation({
      isInViewport,
      isDocumentVisible,
      prefersReducedMotion,
      ready: hasRendered,
    });

    const schedule = () => {
      if (animationFrame || disposed || !canAnimate()) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    const render = (time) => {
      animationFrame = 0;
      if (!canAnimate()) return;
      const interval = getPortraitFrameInterval(width);
      if (time - lastFrameAt >= interval) {
        lastFrameAt = time;
        drawFrame(time);
      }
      schedule();
    };

    const rebuild = async () => {
      if (!image.naturalWidth || !wrapper.clientWidth || !wrapper.clientHeight) return;
      width = Math.max(1, Math.round(wrapper.clientWidth));
      height = Math.max(1, Math.round(wrapper.clientHeight));
      if (width === lastBuiltWidth && height === lastBuiltHeight) return;
      lastBuiltWidth = width;
      lastBuiltHeight = height;
      const sequence = ++rebuildSequence;
      const deviceScale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * deviceScale));
      canvas.height = Math.max(1, Math.round(height * deviceScale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      try {
        await renderer.rebuild(image, width, height, normalizedConfig);
      } catch {
        if (sequence === rebuildSequence) {
          lastBuiltWidth = 0;
          lastBuiltHeight = 0;
        }
        return;
      }
      if (disposed || sequence !== rebuildSequence) return;
      drawFrame(prefersReducedMotion ? 0 : performance.now());
      lastFrameAt = 0;
      schedule();
    };

    const stopAnimation = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) {
        lastFrameAt = 0;
        schedule();
      } else stopAnimation();
    };

    const handleMotionChange = (event) => {
      prefersReducedMotion = event.matches;
      stopAnimation();
      lastFrameAt = 0;
      if (prefersReducedMotion) drawFrame(0);
      else schedule();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        if (!isInViewport) stopAnimation();
        else if (prefersReducedMotion) drawFrame(0);
        else {
          lastFrameAt = 0;
          schedule();
        }
      },
      { threshold: 0.05 },
    );
    const resizeObserver = new ResizeObserver(rebuild);

    const handleImageLoad = async () => {
      try {
        if (image.decode) await image.decode();
      } catch {
        // A loaded image can still be drawn when explicit decode is unavailable.
      }
      if (!disposed) rebuild();
    };

    setReady(false);
    image.addEventListener("load", handleImageLoad);
    image.src = src;
    observer.observe(wrapper);
    resizeObserver.observe(wrapper);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener?.("change", handleMotionChange);
    if (image.complete && image.naturalWidth) handleImageLoad();

    return () => {
      disposed = true;
      image.removeEventListener("load", handleImageLoad);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener?.("change", handleMotionChange);
      stopAnimation();
    };
  }, [src, normalizedConfig]);

  return (
    <div
      ref={wrapperRef}
      className={`ascii-portrait ${ready ? "is-ready" : ""} ${className}`.trim()}
    >
      <img
        className={`ascii-portrait__image ${imageClassName}`.trim()}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <canvas
        ref={canvasRef}
        className="ascii-portrait__canvas"
        aria-hidden="true"
      />
    </div>
  );
}
