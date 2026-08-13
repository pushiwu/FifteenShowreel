import { useEffect, useRef, useState } from "react";
import {
  clamp,
  getContainRect,
  getLineMetrics,
  getPortraitCellSize,
  getPortraitFrameInterval,
  shapePortraitLuminance,
  shouldDrawPortraitCell,
  shouldRunPortraitAnimation,
} from "../utils/asciiPortrait";

import "./AsciiPortrait.css";

const SOURCE_OPACITY = 0.5;
const COVERAGE = 50;
const DENSITY = 0.16;
const EDGE_EMPHASIS = 0.72;
const TINT = { r: 150, g: 112, b: 78 };

function createNoiseTexture(size = 96) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const imageData = context.createImageData(size, size);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const value = Math.floor(Math.random() * 255);
    imageData.data[index] = value;
    imageData.data[index + 1] = value;
    imageData.data[index + 2] = value;
    imageData.data[index + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

function drawImageContain(context, image, width, height, scale = 1) {
  const rect = getContainRect(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    width,
    height,
    scale,
  );
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  return rect;
}

function samplePortrait(image, width, height, cellSize) {
  const columns = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = columns;
  sampleCanvas.height = rows;
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!sampleContext) return null;

  sampleContext.fillStyle = "#111";
  sampleContext.fillRect(0, 0, columns, rows);
  drawImageContain(sampleContext, image, columns, rows);

  const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
  const cells = [];
  const getLuminance = (column, row) => {
    const x = clamp(column, 0, columns - 1);
    const y = clamp(row, 0, rows - 1);
    const offset = (y * columns + x) * 4;
    return (
      pixels[offset] * 0.2126 +
      pixels[offset + 1] * 0.7152 +
      pixels[offset + 2] * 0.0722
    ) / 255;
  };

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const offset = (row * columns + column) * 4;
      const luminance = getLuminance(column, row);
      const rightEdge = Math.abs(luminance - getLuminance(column + 1, row));
      const bottomEdge = Math.abs(luminance - getLuminance(column, row + 1));
      const edge = clamp((rightEdge + bottomEdge) * 2.2, 0, 1);

      cells.push({
        index: row * columns + column,
        x: column * cellSize,
        y: row * cellSize,
        r: pixels[offset],
        g: pixels[offset + 1],
        b: pixels[offset + 2],
        luminance,
        edge,
      });
    }
  }

  return { cells, columns, rows };
}

function drawVignette(context, width, height, intensity) {
  const gradient = context.createRadialGradient(
    width * 0.5,
    height * 0.46,
    Math.min(width, height) * 0.16,
    width * 0.5,
    height * 0.46,
    Math.max(width, height) * 0.72,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.62, `rgba(0, 0, 0, ${intensity * 0.22})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawGrain(context, noiseTexture, width, height, intensity) {
  if (!noiseTexture) return;
  context.save();
  context.globalAlpha = intensity;
  context.globalCompositeOperation = "soft-light";
  context.imageSmoothingEnabled = false;
  context.drawImage(noiseTexture, 0, 0, width, height);
  context.restore();
}

function drawGlitch(context, width, height, time, intensity) {
  const phase = Math.floor(time / 700);
  const signal = Math.abs(Math.sin(phase * 12.9898));
  if (signal < 0.68) return;

  const bandHeight = Math.max(1, Math.round(height * 0.004));
  const y = Math.floor((signal * 1.7 % 1) * height);
  const offset = Math.sin(time * 0.014) * intensity * 8;

  context.save();
  context.globalAlpha = 0.14 * intensity;
  context.globalCompositeOperation = "screen";
  context.fillStyle = "rgba(208, 158, 108, 0.75)";
  context.fillRect(offset, y, width * 0.46, bandHeight);
  context.fillStyle = "rgba(98, 126, 156, 0.65)";
  context.fillRect(width * 0.44 - offset, y + bandHeight, width * 0.34, bandHeight);
  context.restore();
}

export default function AsciiPortrait({
  src,
  alt = "",
  className = "",
  imageClassName = "",
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas || !src) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";

    let width = 0;
    let height = 0;
    let deviceScale = 1;
    let cellSize = 10;
    let samples = null;
    let noiseTexture = null;
    let animationFrame = 0;
    let lastFrameAt = 0;
    let frameCount = 0;
    let isInViewport = false;
    let isDocumentVisible = !document.hidden;
    let prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let isReady = false;
    let disposed = false;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const drawFrame = (time = 0) => {
      if (!samples || !width || !height || disposed) return;

      context.save();
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.filter = "blur(6px) saturate(0.82) contrast(1.15) brightness(0.64)";
      context.globalAlpha = SOURCE_OPACITY;
      drawImageContain(context, image, width, height);
      context.filter = "none";
      context.globalAlpha = 1;

      context.globalCompositeOperation = "color-dodge";
      const flicker = prefersReducedMotion
        ? 0
        : Math.sin(time * 0.006) * 0.08 + Math.sin(time * 0.021) * 0.025;

      samples.cells.forEach((cell) => {
        if (!shouldDrawPortraitCell(cell.index, COVERAGE)) return;

        const tone = shapePortraitLuminance(
          cell.luminance,
          0.64,
          1.15,
          true,
        );
        const metrics = getLineMetrics(
          clamp(tone + flicker * 0.16, 0, 1),
          cell.edge * EDGE_EMPHASIS,
          cellSize,
          DENSITY,
        );
        const mix = clamp((1 - tone) * 0.4 + cell.edge * 0.5, 0, 1);
        const r = Math.round(TINT.r * (1 - mix) + cell.r * mix);
        const g = Math.round(TINT.g * (1 - mix) + cell.g * mix);
        const b = Math.round(TINT.b * (1 - mix) + cell.b * mix);
        const centerX = cell.x + cellSize * 0.5;
        const centerY = cell.y + cellSize * 0.5;
        const angle = (cell.edge - 0.5) * 0.7 + Math.sin(time * 0.002 + cell.index) * 0.03;
        const halfLength = metrics.length * 0.5;

        context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${metrics.alpha})`;
        context.lineWidth = metrics.lineWidth;
        context.beginPath();
        context.moveTo(
          centerX - Math.cos(angle) * halfLength,
          centerY - Math.sin(angle) * halfLength,
        );
        context.lineTo(
          centerX + Math.cos(angle) * halfLength,
          centerY + Math.sin(angle) * halfLength,
        );
        context.stroke();
      });

      context.globalCompositeOperation = "source-over";
      if (!prefersReducedMotion && frameCount % 3 === 0) {
        noiseTexture = createNoiseTexture();
      }
      drawGrain(context, noiseTexture, width, height, 0.08);
      drawVignette(context, width, height, 0.38);
      drawGlitch(context, width, height, time, 0.2);
      context.restore();

      if (!isReady) {
        isReady = true;
        setReady(true);
      }
      frameCount += 1;
    };

    const schedule = () => {
      if (animationFrame || disposed) return;
      if (!shouldRunPortraitAnimation({
        isInViewport,
        isDocumentVisible,
        prefersReducedMotion,
        ready: isReady,
      })) {
        return;
      }
      animationFrame = window.requestAnimationFrame(render);
    };

    const render = (time) => {
      animationFrame = 0;
      if (!shouldRunPortraitAnimation({
        isInViewport,
        isDocumentVisible,
        prefersReducedMotion,
        ready: isReady,
      })) {
        return;
      }

      const interval = getPortraitFrameInterval(width);
      if (time - lastFrameAt < interval) {
        schedule();
        return;
      }
      lastFrameAt = time;
      drawFrame(time);
      schedule();
    };

    const rebuild = () => {
      if (!image.naturalWidth || !wrapper.clientWidth || !wrapper.clientHeight) return;
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      cellSize = getPortraitCellSize(width);
      deviceScale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(width * deviceScale));
      canvas.height = Math.max(1, Math.floor(height * deviceScale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      samples = samplePortrait(image, width, height, cellSize);
      noiseTexture = createNoiseTexture();
      if (samples) {
        drawFrame(prefersReducedMotion ? 0 : performance.now());
        if (!prefersReducedMotion) schedule();
      }
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (!isDocumentVisible) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        lastFrameAt = 0;
        schedule();
      }
    };

    const handleMotionChange = (event) => {
      prefersReducedMotion = event.matches;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrameAt = 0;
      if (prefersReducedMotion) drawFrame(0);
      else schedule();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        if (!isInViewport) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        } else if (prefersReducedMotion) {
          drawFrame(0);
        } else {
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
        // The loaded image can still be drawn when decode is unavailable.
      }
      if (disposed) return;
      rebuild();
    };

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
      window.cancelAnimationFrame(animationFrame);
    };
  }, [src]);

  return (
    <div
      ref={wrapperRef}
      className={`ascii-portrait ${ready ? "is-ready" : ""} ${className}`.trim()}
    >
      <img
        ref={imageRef}
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
