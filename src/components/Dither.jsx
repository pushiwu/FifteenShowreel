import { useEffect, useRef } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function Dither({
  waveColor = [1, 1, 1],
  disableAnimation = false,
  enableMouseInteraction = false,
  mouseRadius = 0.9,
  colorNum = 3,
  pixelSize = 1,
  waveAmplitude = 0.25,
  waveFrequency = 4,
  waveSpeed = 0.07,
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    if (!enableMouseInteraction) return undefined;

    let frame = 0;
    let pendingEvent = null;

    const updateMouse = (event) => {
      pendingEvent = event;
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        if (pendingEvent) {
          mouseRef.current = {
            x: pendingEvent.clientX / window.innerWidth,
            y: pendingEvent.clientY / window.innerHeight,
            active: true,
          };
        }
        pendingEvent = null;
        frame = 0;
      });
    };

    const resetMouse = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("pointermove", updateMouse);
    window.addEventListener("pointerleave", resetMouse);

    return () => {
      window.removeEventListener("pointermove", updateMouse);
      window.removeEventListener("pointerleave", resetMouse);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enableMouseInteraction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const mobileViewport = window.matchMedia("(max-width: 700px)");
    if (reducedMotion.matches || mobileViewport.matches) return undefined;

    let animationFrame = 0;
    let lastFrameAt = 0;
    let isPageVisible = !document.hidden;
    let isInViewport = true;
    let renderWidth = 0;
    let renderHeight = 0;
    let imageData = null;
    let data = null;

    const targetColor = waveColor.map((channel) => clamp(channel, 0, 1) * 255);
    const levels = Math.max(2, colorNum);
    const fpsInterval = 1000 / 24;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const deviceScale = Math.min(window.devicePixelRatio || 1, 1.25);
      const sampleScale = Math.max(2, pixelSize * 2 * deviceScale);

      renderWidth = Math.max(240, Math.floor(width / sampleScale));
      renderHeight = Math.max(160, Math.floor(height / sampleScale));

      canvas.width = renderWidth;
      canvas.height = renderHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      imageData = context.createImageData(renderWidth, renderHeight);
      data = imageData.data;
      context.imageSmoothingEnabled = false;
    };

    const schedule = () => {
      if (animationFrame || !isPageVisible || !isInViewport) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    const render = (time) => {
      animationFrame = 0;
      if (!isPageVisible || !isInViewport) return;

      if (!disableAnimation && time - lastFrameAt < fpsInterval) {
        schedule();
        return;
      }

      lastFrameAt = time;
      const elapsed = disableAnimation ? 0 : time * waveSpeed * 0.001;
      const mouse = mouseRef.current;

      for (let y = 0; y < renderHeight; y += 1) {
        for (let x = 0; x < renderWidth; x += 1) {
          const index = (y * renderWidth + x) * 4;
          const u = x / Math.max(1, renderWidth - 1);
          const v = y / Math.max(1, renderHeight - 1);

          const dx = u - mouse.x;
          const dy = v - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const mouseInfluence =
            enableMouseInteraction && mouse.active
              ? Math.max(0, 1 - distance / Math.max(mouseRadius, 0.001))
              : 0;

          const horizontalWave =
            Math.sin((u * waveFrequency + elapsed) * Math.PI * 2) *
            waveAmplitude;
          const verticalWave =
            Math.cos((v * (waveFrequency * 0.7) - elapsed * 1.12) * Math.PI * 2) *
            (waveAmplitude * 0.72);
          const diagonalWave =
            Math.sin(((u + v) * (waveFrequency * 0.55) + elapsed * 0.7) * Math.PI * 2) *
            (waveAmplitude * 0.4);

          let value = 0.08 + horizontalWave + verticalWave + diagonalWave;
          value += mouseInfluence * 0.22;

          const vignette = 1 - Math.hypot(u - 0.5, v - 0.46) * 1.3;
          value += vignette * 0.12;

          const quantized =
            Math.round(clamp(value, 0, 1) * (levels - 1)) / (levels - 1);

          data[index] = targetColor[0] * quantized;
          data[index + 1] = targetColor[1] * quantized;
          data[index + 2] = targetColor[2] * quantized;
          data[index + 3] = Math.round(255 * clamp(quantized, 0, 1));
        }
      }

      context.putImageData(imageData, 0, 0);
      schedule();
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      schedule();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        schedule();
      },
      { threshold: 0 }
    );

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    observer.observe(canvas);
    schedule();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [
    colorNum,
    disableAnimation,
    enableMouseInteraction,
    mouseRadius,
    pixelSize,
    waveAmplitude,
    waveColor,
    waveFrequency,
    waveSpeed,
  ]);

  return <canvas ref={canvasRef} aria-hidden="true" className="dither-canvas" />;
}
