import { useEffect, useRef } from "react";

const DEFAULT_COLORS = ["#1A1A1A", "#333333", "#4D4D4D", "#666666", "#808080"];

function parseColor(color) {
  const value = color.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((channel) => `${channel}${channel}`).join("")
    : value;

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function LiquidEther({
  mouseForce = 10,
  cursorSize = 110,
  isViscous = true,
  viscous = 40,
  colors = DEFAULT_COLORS,
  autoDemo = true,
  autoSpeed = 0.7,
  autoIntensity = 2.9,
  isBounce = true,
  resolution = 0.5,
}) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const palette = colors.map(parseColor);
    const blobs = palette.slice(1).map((_, index) => ({
      x: 0.18 + index * 0.19,
      y: 0.3 + (index % 2) * 0.35,
      vx: (index % 2 ? -1 : 1) * (0.00008 + index * 0.000025),
      vy: (index % 2 ? 1 : -1) * (0.00006 + index * 0.00002),
      phase: index * 1.7,
      radius: 0.28 + index * 0.025,
    }));

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrameAt = 0;
    let isPageVisible = !document.hidden;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    let reducedMotion = motionQuery.matches;
    let mobileViewport = mobileQuery.matches;

    const resize = () => {
      const scale = clamp(resolution, 0.25, 1);
      width = Math.max(320, Math.floor(window.innerWidth * scale));
      height = Math.max(220, Math.floor(window.innerHeight * scale));
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const updatePointer = (event) => {
      pointerRef.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        active: true,
      };
    };

    const resetPointer = () => {
      pointerRef.current.active = false;
    };

    const drawBlob = (blob, color, time, index) => {
      const pulse = Math.sin(time * 0.0012 + blob.phase) * 0.035;
      const radius = (blob.radius + pulse) * Math.max(width, height);
      const x = blob.x * width;
      const y = blob.y * height;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      const alpha = 0.68 - index * 0.055;

      gradient.addColorStop(0, `rgba(${color.join(",")}, ${alpha})`);
      gradient.addColorStop(0.48, `rgba(${color.join(",")}, ${alpha * 0.55})`);
      gradient.addColorStop(1, `rgba(${color.join(",")}, 0)`);

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const draw = (time) => {
      const pointer = pointerRef.current;
      const autoX = 0.5 + Math.sin(time * 0.00016 * autoSpeed) * 0.3;
      const autoY = 0.48 + Math.cos(time * 0.00013 * autoSpeed) * 0.24;
      const targetX = pointer.active ? pointer.x : autoDemo ? autoX : 0.5;
      const targetY = pointer.active ? pointer.y : autoDemo ? autoY : 0.5;
      const force = (pointer.active ? mouseForce : autoIntensity) * 0.000012;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      context.fillStyle = `rgb(${palette[0].join(",")})`;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      blobs.forEach((blob, index) => {
        const dx = targetX - blob.x;
        const dy = targetY - blob.y;
        const damping = isViscous ? clamp(1 - viscous / 900, 0.84, 0.99) : 0.992;

        blob.vx += dx * force * (index + 1);
        blob.vy += dy * force * (index + 1);
        blob.vx *= damping;
        blob.vy *= damping;
        blob.x += blob.vx * (time - lastFrameAt + 16);
        blob.y += blob.vy * (time - lastFrameAt + 16);

        if (isBounce) {
          if (blob.x < 0.08 || blob.x > 0.92) blob.vx *= -1;
          if (blob.y < 0.08 || blob.y > 0.92) blob.vy *= -1;
          blob.x = clamp(blob.x, 0.04, 0.96);
          blob.y = clamp(blob.y, 0.04, 0.96);
        }

        drawBlob(blob, palette[index + 1] || palette[palette.length - 1], time, index);
      });

      context.globalCompositeOperation = "source-over";
      const cursorRadius = (cursorSize / Math.max(window.innerWidth, window.innerHeight)) * Math.max(width, height);
      const cursorGlow = context.createRadialGradient(
        targetX * width,
        targetY * height,
        0,
        targetX * width,
        targetY * height,
        cursorRadius
      );
      cursorGlow.addColorStop(0, "rgba(242, 242, 242, 0.08)");
      cursorGlow.addColorStop(1, "rgba(242, 242, 242, 0)");
      context.fillStyle = cursorGlow;
      context.beginPath();
      context.arc(targetX * width, targetY * height, cursorRadius, 0, Math.PI * 2);
      context.fill();

    };

    const schedule = () => {
      if (animationFrame || reducedMotion || !isPageVisible) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    const render = (time) => {
      animationFrame = 0;
      if (!isPageVisible || reducedMotion) return;

      const fps = mobileViewport ? 18 : 30;
      if (time - lastFrameAt < 1000 / fps) {
        schedule();
        return;
      }

      lastFrameAt = time;
      draw(time);
      schedule();
    };

    const renderStaticFrame = () => {
      draw(performance.now());
    };

    const handleResize = () => {
      resize();
      if (reducedMotion) renderStaticFrame();
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (!isPageVisible) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }
      lastFrameAt = 0;
      if (reducedMotion) renderStaticFrame();
      else schedule();
    };

    const handleMotionPreference = (event) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        renderStaticFrame();
      } else {
        lastFrameAt = 0;
        schedule();
      }
    };

    const handleViewportChange = (event) => {
      mobileViewport = event.matches;
      lastFrameAt = 0;
      schedule();
    };

    resize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener?.("change", handleMotionPreference);
    mobileQuery.addEventListener?.("change", handleViewportChange);
    if (reducedMotion) renderStaticFrame();
    else schedule();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener?.("change", handleMotionPreference);
      mobileQuery.removeEventListener?.("change", handleViewportChange);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [
    autoIntensity,
    autoSpeed,
    colors,
    cursorSize,
    isBounce,
    isViscous,
    mouseForce,
    resolution,
    viscous,
  ]);

  return <canvas ref={canvasRef} aria-hidden="true" className="liquid-ether-canvas" />;
}
