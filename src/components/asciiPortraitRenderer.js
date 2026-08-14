import {
  applyToneCurve,
  clamp,
  encodeBraille,
  getAnimationModulation,
  getContainRect,
  getPortraitCellOpacity,
  shapeAsciiCellTone,
  shouldDrawPortraitCell,
} from "../utils/asciiPortrait";

const CHAR_SETS = {
  standard: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
};

const BLEND_MODES = new Set([
  "source-over",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]);

function makeCanvas() {
  return document.createElement("canvas");
}

function sizeCanvas(canvas, width, height) {
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
}

function hash(index, salt = 0) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function blendMode(value, fallback = "source-over") {
  return BLEND_MODES.has(value) ? value : fallback;
}

function parseHexColor(value) {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value || "");
  if (!match) return { r: 139, g: 90, b: 43 };
  const hex = match[1].length === 3
    ? match[1].split("").map((part) => `${part}${part}`).join("")
    : match[1];
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function luminanceAt(pixels, width, height, x, y) {
  const px = clamp(Math.floor(x), 0, width - 1);
  const py = clamp(Math.floor(y), 0, height - 1);
  const offset = (py * width + px) * 4;
  const luminance = (
    pixels[offset] * 0.2126 +
    pixels[offset + 1] * 0.7152 +
    pixels[offset + 2] * 0.0722
  ) / 255;
  return luminance * (pixels[offset + 3] / 255);
}

function averageRegion(pixels, width, height, startX, startY, endX, endY) {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  let count = 0;
  const stride = Math.max(1, Math.floor(Math.min(endX - startX, endY - startY) / 5));
  for (let y = startY; y < endY; y += stride) {
    for (let x = startX; x < endX; x += stride) {
      const px = clamp(Math.floor(x), 0, width - 1);
      const py = clamp(Math.floor(y), 0, height - 1);
      const offset = (py * width + px) * 4;
      const alpha = pixels[offset + 3] / 255;
      r += pixels[offset] * alpha;
      g += pixels[offset + 1] * alpha;
      b += pixels[offset + 2] * alpha;
      a += alpha;
      count += 1;
    }
  }
  return {
    r: a ? r / a : 0,
    g: a ? g / a : 0,
    b: a ? b / a : 0,
    a: count ? a / count : 0,
  };
}

function buildSamples(sourceCanvas, config) {
  const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { cells: [], columns: 0, rows: 0 };
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const pixels = context.getImageData(0, 0, width, height).data;
  const cellSize = config.cellSize;
  const columns = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const cells = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * cellSize;
      const y = row * cellSize;
      const endX = Math.min(width, x + cellSize);
      const endY = Math.min(height, y + cellSize);
      const color = averageRegion(pixels, width, height, x, y, endX, endY);
      const luminance = (color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722) / 255;
      const subLuminance = [];
      for (let dotY = 0; dotY < 4; dotY += 1) {
        for (let dotX = 0; dotX < 2; dotX += 1) {
          subLuminance.push(luminanceAt(
            pixels,
            width,
            height,
            x + ((dotX + 0.5) / 2) * cellSize,
            y + ((dotY + 0.5) / 4) * cellSize,
          ));
        }
      }
      cells.push({
        index: row * columns + column,
        column,
        row,
        x,
        y,
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: color.a,
        luminance,
        tone: applyToneCurve(luminance, config.toneCurve),
        subLuminance,
        edge: 0,
      });
    }
  }

  const getCell = (column, row) => cells[
    clamp(row, 0, rows - 1) * columns + clamp(column, 0, columns - 1)
  ];
  cells.forEach((cell) => {
    const right = getCell(cell.column + 1, cell.row)?.luminance ?? cell.luminance;
    const bottom = getCell(cell.column, cell.row + 1)?.luminance ?? cell.luminance;
    cell.edge = clamp((Math.abs(cell.luminance - right) + Math.abs(cell.luminance - bottom)) * 2.4, 0, 1);
  });
  return { cells, columns, rows };
}

function cellTone(cell, config, modulation = 0) {
  return shapeAsciiCellTone(
    cell.tone,
    config.invert,
    cell.edge,
    config.edgeEmphasis / 100,
    modulation,
  );
}

function cellColor(cell, tone, alpha = 1) {
  const lift = 0.42 + tone * 0.82;
  const opacity = getPortraitCellOpacity(cell.alpha, tone) * alpha;
  return `rgba(${Math.round(clamp(cell.r * lift, 0, 255))}, ${Math.round(clamp(cell.g * lift, 0, 255))}, ${Math.round(clamp(cell.b * lift, 0, 255))}, ${clamp(opacity, 0, 1)})`;
}

function polygon(context, centerX, centerY, radius, sides, rotation = 0) {
  context.beginPath();
  for (let side = 0; side < sides; side += 1) {
    const angle = rotation + (Math.PI * 2 * side) / sides;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (side === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function drawHeart(context, x, y, size) {
  context.beginPath();
  context.moveTo(x, y + size * 0.35);
  context.bezierCurveTo(x - size, y - size * 0.25, x - size * 0.45, y - size, x, y - size * 0.45);
  context.bezierCurveTo(x + size * 0.45, y - size, x + size, y - size * 0.25, x, y + size * 0.35);
  context.closePath();
}

function drawStar(context, x, y, radius) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * Math.PI / 5;
    const length = point % 2 ? radius * 0.42 : radius;
    const px = x + Math.cos(angle) * length;
    const py = y + Math.sin(angle) * length;
    if (point === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
}

function drawBraille(context, cell, config, tone, modulation) {
  const threshold = clamp(0.74 - config.density / 180 - cell.edge * config.edgeEmphasis / 240 + modulation, 0.08, 0.92);
  const dots = cell.subLuminance.map((value, index) => {
    const shaped = config.invert ? 1 - value : value;
    return shaped + (hash(cell.index, index) - 0.5) * 0.12 > threshold;
  });
  const glyph = encodeBraille(dots);
  if (glyph === " ") return;
  context.font = `${Math.max(7, config.cellSize * 1.08)}px ui-monospace, "Cascadia Mono", Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = cellColor(cell, tone, 0.38 + tone * 0.62);
  context.fillText(glyph, cell.x + config.cellSize * 0.5, cell.y + config.cellSize * 0.5);
}

function drawGlyph(context, cell, config, tone, chars) {
  const index = clamp(Math.floor(tone * (chars.length - 1)), 0, chars.length - 1);
  context.font = `${Math.max(6, config.cellSize * (0.48 + tone * 0.54))}px ui-monospace, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = cellColor(cell, tone, 0.25 + tone * 0.75);
  context.fillText(chars[index], cell.x + config.cellSize / 2, cell.y + config.cellSize / 2);
}

function drawShape(context, cell, config, tone, mode, time) {
  const size = config.cellSize;
  const centerX = cell.x + size / 2;
  const centerY = cell.y + size / 2;
  const radius = Math.max(0.75, size * (0.08 + tone * 0.42));
  context.fillStyle = cellColor(cell, tone, 0.25 + tone * 0.72);
  context.strokeStyle = cellColor(cell, tone, 0.3 + tone * 0.68);
  context.lineWidth = Math.max(0.7, size * (0.025 + cell.edge * 0.08));

  if (mode === "dither") {
    if (hash(cell.index, 3) < tone) context.fillRect(centerX - 1, centerY - 1, 2, 2);
  } else if (mode === "mosaic" || mode === "pixel") {
    context.globalAlpha = mode === "mosaic" ? 0.72 : 0.92;
    context.fillRect(cell.x, cell.y, size + 0.5, size + 0.5);
  } else if (mode === "dots" || mode === "disco" || mode === "bubbles") {
    context.beginPath();
    context.arc(centerX, centerY, mode === "bubbles" ? radius : radius * 0.72, 0, Math.PI * 2);
    if (mode === "bubbles") context.stroke();
    else context.fill();
  } else if (mode === "cross") {
    context.beginPath();
    context.moveTo(centerX - radius, centerY);
    context.lineTo(centerX + radius, centerY);
    context.moveTo(centerX, centerY - radius);
    context.lineTo(centerX, centerY + radius);
    context.stroke();
  } else if (mode === "diamond") {
    polygon(context, centerX, centerY, radius, 4, Math.PI / 4);
    context.fill();
  } else if (mode === "voxel" || mode === "lego") {
    const side = radius * 1.25;
    context.fillRect(centerX - side / 2, centerY - side / 2, side, side);
    context.globalAlpha = 0.45;
    context.fillStyle = "white";
    if (mode === "lego") {
      context.beginPath();
      context.arc(centerX, centerY - side * 0.28, side * 0.18, 0, Math.PI * 2);
      context.fill();
    } else context.fillRect(centerX - side / 2, centerY - side / 2, side, side * 0.22);
  } else if (mode === "lines" || mode === "diagonal") {
    const angle = mode === "diagonal" ? -Math.PI / 4 : (cell.edge - 0.5) * Math.PI;
    context.beginPath();
    context.moveTo(centerX - Math.cos(angle) * radius, centerY - Math.sin(angle) * radius);
    context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    context.stroke();
  } else if (mode === "rings") {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
  } else if (mode === "hearts") {
    drawHeart(context, centerX, centerY, radius);
    context.fill();
  } else if (mode === "stars") {
    drawStar(context, centerX, centerY, radius);
    context.fill();
  } else if (mode === "hexagons") {
    polygon(context, centerX + (cell.row % 2 ? size * 0.25 : 0), centerY, radius, 6, Math.PI / 6);
    context.stroke();
  } else if (mode === "triangles") {
    polygon(context, centerX, centerY, radius, 3, cell.index % 2 ? Math.PI / 2 : -Math.PI / 2);
    context.fill();
  } else if (mode === "hatch") {
    const gap = Math.max(3, size / 4);
    for (let offset = -size; offset <= size; offset += gap) {
      context.beginPath();
      context.moveTo(cell.x, cell.y + offset);
      context.lineTo(cell.x + size, cell.y + offset + size);
      context.stroke();
      if (tone > 0.55) {
        context.beginPath();
        context.moveTo(cell.x + size, cell.y + offset);
        context.lineTo(cell.x, cell.y + offset + size);
        context.stroke();
      }
    }
  } else if (mode === "contour") {
    const level = Math.round(tone * 8) / 8;
    if (Math.abs(tone - level) < 0.08 + cell.edge * 0.1) {
      context.beginPath();
      context.arc(centerX, centerY, radius * (0.5 + hash(cell.index, 8)), 0, Math.PI * 2);
      context.stroke();
    }
  } else if (mode === "halfblocks") {
    const topTone = config.invert ? 1 - cell.subLuminance[0] : cell.subLuminance[0];
    const bottomTone = config.invert ? 1 - cell.subLuminance[6] : cell.subLuminance[6];
    context.globalAlpha = clamp(topTone, 0.1, 1);
    context.fillRect(cell.x, cell.y, size, size / 2);
    context.globalAlpha = clamp(bottomTone, 0.1, 1);
    context.fillRect(cell.x, cell.y + size / 2, size, size / 2);
  } else if (mode === "mixed") {
    drawShape(context, cell, config, tone, ["dots", "cross", "diamond", "lines"][cell.index % 4], time);
  }
  context.globalAlpha = 1;
}

function drawMatrix(context, cell, config, tone, time, matrixState) {
  const column = cell.column;
  if (!matrixState[column]) matrixState[column] = hash(column, 22) * 20;
  const head = (time * 0.015 + matrixState[column]) % Math.max(1, matrixState.rows + 8);
  const distance = head - cell.row;
  if (distance < 0 || distance > 9 || tone < 0.14) return;
  context.font = `${config.cellSize * 0.82}px ui-monospace, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = `rgba(${distance < 1 ? 210 : 40}, ${distance < 1 ? 255 : 220}, ${distance < 1 ? 210 : 90}, ${clamp(1 - distance / 10, 0, 1)})`;
  context.fillText(String.fromCharCode(0x30a0 + Math.floor(hash(cell.index, Math.floor(time / 120)) * 80)), cell.x + config.cellSize / 2, cell.y + config.cellSize / 2);
}

function renderPrimitive(context, samples, config, time, matrixState) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const speed = config.animSpeed.enabled ? config.animSpeed.intensity / 100 : 0;
  const intensity = config.animated && config.animIntensity.enabled
    ? config.animIntensity.intensity / 100
    : 0;
  const chars = config.customChars || CHAR_SETS[config.charSet] || CHAR_SETS.standard;

  for (const cell of samples.cells) {
    if (cell.alpha <= 0.01) continue;
    if (!shouldDrawPortraitCell(cell.index, config.coverage)) continue;
    const modulation = config.animated
      ? getAnimationModulation(
          config.animStyle,
          time * speed,
          cell.column,
          cell.row,
          config.cellSize,
          intensity * 0.16,
        )
      : 0;
    const tone = cellTone(cell, config, modulation);
    if (tone < 0.035 && cell.edge < 0.08) continue;

    context.save();
    switch (config.renderMode) {
      case "characters":
        drawGlyph(context, cell, config, tone, chars);
        break;
      case "hexdump":
        drawGlyph(context, cell, config, tone, "0123456789ABCDEF");
        break;
      case "braille":
        drawBraille(context, cell, config, tone, modulation);
        break;
      case "matrix":
        drawMatrix(context, cell, config, tone, time * speed, matrixState);
        break;
      default:
        drawShape(context, cell, config, tone, config.renderMode, time);
    }
    context.restore();
  }
}

function applySourceAlphaMask(context, sourceCanvas) {
  context.save();
  context.globalCompositeOperation = "destination-in";
  context.drawImage(sourceCanvas, 0, 0);
  context.restore();
}

function drawBackground(context, sourceCanvas, config) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (config.bgMode === "none") return;
  if (config.bgMode === "solid") {
    context.globalAlpha = config.bgOpacity / 100;
    context.fillStyle = config.bgColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  } else {
    context.globalAlpha = config.bgOpacity / 100;
    context.filter = config.bgMode === "blurred" || config.bgBlur > 0
      ? `blur(${config.bgBlur}px)`
      : "none";
    const overscan = config.bgBlur * 2;
    context.drawImage(sourceCanvas, -overscan, -overscan, context.canvas.width + overscan * 2, context.canvas.height + overscan * 2);
  }
  context.filter = "none";
  context.globalAlpha = 1;
}

function applyColorAdjustments(context, inputCanvas, config) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.filter = [
    `brightness(${config.brightness}%)`,
    `contrast(${config.contrast}%)`,
    `saturate(${config.saturation}%)`,
    `grayscale(${config.grayscale}%)`,
  ].join(" ");
  context.drawImage(inputCanvas, 0, 0);
  context.filter = "none";

  if (config.tintOpacity > 0) {
    context.save();
    context.globalCompositeOperation = blendMode(config.overlayBlend, "hard-light");
    context.globalAlpha = config.tintOpacity / 100;
    context.fillStyle = config.tint;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
  }
}

function applyConfiguredBlur(context, inputCanvas, config) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (config.blurType === "off" || config.blurAmount <= 0) {
    context.drawImage(inputCanvas, 0, 0);
    return;
  }
  const amount = config.blurAmount;
  if (config.blurType === "directional") {
    const angle = config.blurAngle * Math.PI / 180;
    const passes = 7;
    context.globalAlpha = 1 / passes;
    for (let pass = -3; pass <= 3; pass += 1) {
      if (!config.directionalBothSides && pass < 0) continue;
      context.drawImage(inputCanvas, Math.cos(angle) * pass * amount / 3, Math.sin(angle) * pass * amount / 3);
    }
    context.globalAlpha = 1;
    return;
  }
  context.filter = `blur(${amount}px)`;
  context.drawImage(inputCanvas, 0, 0);
  context.filter = "none";
  if (["tilt", "lens", "progressive"].includes(config.blurType)) {
    context.save();
    context.globalCompositeOperation = "destination-in";
    const gradient = config.blurType === "lens"
      ? context.createRadialGradient(
          context.canvas.width * config.blurCenterX / 100,
          context.canvas.height * config.blurCenterY / 100,
          0,
          context.canvas.width * config.blurCenterX / 100,
          context.canvas.height * config.blurCenterY / 100,
          Math.max(context.canvas.width, context.canvas.height) * config.lensFocus / 100,
        )
      : context.createLinearGradient(0, 0, 0, context.canvas.height);
    if (config.blurType === "lens") {
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.55, "rgba(0,0,0,.5)");
      gradient.addColorStop(1, "black");
    } else {
      const position = (config.blurType === "tilt" ? config.tiltPosition : config.progressivePosition) / 100;
      gradient.addColorStop(0, config.progressiveReverse ? "black" : "transparent");
      gradient.addColorStop(clamp(position, 0.01, 0.99), "rgba(0,0,0,.45)");
      gradient.addColorStop(1, config.progressiveReverse ? "transparent" : "black");
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
    context.globalCompositeOperation = "destination-over";
    context.drawImage(inputCanvas, 0, 0);
    context.globalCompositeOperation = "source-over";
  }
}

function drawNoise(context, noiseCanvas, intensity, time) {
  context.save();
  context.globalAlpha = intensity * 0.18;
  context.globalCompositeOperation = "soft-light";
  const offset = Math.floor(time / 70) % noiseCanvas.width;
  context.translate(-offset, -offset);
  for (let y = 0; y < context.canvas.height + noiseCanvas.height; y += noiseCanvas.height) {
    for (let x = 0; x < context.canvas.width + noiseCanvas.width; x += noiseCanvas.width) {
      context.drawImage(noiseCanvas, x, y);
    }
  }
  context.restore();
}

function drawPostEffects(context, scratchContext, noiseCanvas, config, time) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const pfx = config.pfx;

  if (pfx.scanLines.enabled) {
    context.save();
    context.globalAlpha = pfx.scanLines.intensity / 250;
    context.fillStyle = "black";
    for (let y = 0; y < height; y += 4) context.fillRect(0, y, width, 1);
    context.restore();
  }
  if (pfx.vignette.enabled) {
    const gradient = context.createRadialGradient(width / 2, height * 0.46, Math.min(width, height) * 0.12, width / 2, height / 2, Math.max(width, height) * 0.7);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.62, `rgba(0,0,0,${pfx.vignette.intensity / 420})`);
    gradient.addColorStop(1, `rgba(0,0,0,${pfx.vignette.intensity / 100})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }
  if (pfx.bloom.enabled) {
    scratchContext.clearRect(0, 0, width, height);
    scratchContext.filter = `blur(${2 + pfx.bloom.intensity / 6}px)`;
    scratchContext.drawImage(context.canvas, 0, 0);
    scratchContext.filter = "none";
    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = pfx.bloom.intensity / 180;
    context.drawImage(scratchContext.canvas, 0, 0);
    context.restore();
  }
  if (pfx.chromatic.enabled) {
    const offset = Math.max(1, pfx.chromatic.intensity / 8);
    scratchContext.clearRect(0, 0, width, height);
    scratchContext.drawImage(context.canvas, 0, 0);
    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = pfx.chromatic.intensity / 250;
    context.drawImage(scratchContext.canvas, offset, 0);
    context.drawImage(scratchContext.canvas, -offset, 0);
    context.restore();
  }
  if (pfx.filmGrain.enabled) drawNoise(context, noiseCanvas, pfx.filmGrain.intensity / 100, time);
  if (pfx.glitch.enabled && hash(Math.floor(time / 180), 41) > 0.7) {
    scratchContext.clearRect(0, 0, width, height);
    scratchContext.drawImage(context.canvas, 0, 0);
    const bands = 1 + Math.floor(pfx.glitch.intensity / 18);
    for (let band = 0; band < bands; band += 1) {
      const y = hash(Math.floor(time / 90), band) * height;
      const bandHeight = 1 + hash(band, 7) * Math.max(2, height * 0.025);
      const offset = (hash(band, Math.floor(time / 60)) - 0.5) * pfx.glitch.intensity;
      context.drawImage(scratchContext.canvas, 0, y, width, bandHeight, offset, y, width, bandHeight);
    }
  }
  if (pfx.halftone.enabled) {
    context.save();
    context.globalAlpha = pfx.halftone.intensity / 280;
    context.fillStyle = "black";
    const gap = Math.max(4, 14 - pfx.halftone.intensity / 10);
    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        context.beginPath();
        context.arc(x, y, 1.1, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }
  if (pfx.pixelate.enabled) {
    const scale = Math.max(2, Math.round(2 + pfx.pixelate.intensity / 8));
    sizeCanvas(scratchContext.canvas, Math.ceil(width / scale), Math.ceil(height / scale));
    scratchContext.imageSmoothingEnabled = false;
    scratchContext.drawImage(context.canvas, 0, 0, scratchContext.canvas.width, scratchContext.canvas.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(scratchContext.canvas, 0, 0, width, height);
    context.imageSmoothingEnabled = true;
    sizeCanvas(scratchContext.canvas, width, height);
  }
  if (pfx.filmDust.enabled) {
    context.save();
    context.globalAlpha = pfx.filmDust.intensity / 130;
    context.fillStyle = "rgba(255,245,225,.8)";
    for (let index = 0; index < Math.ceil(pfx.filmDust.intensity / 2); index += 1) {
      const seed = Math.floor(time / 160) * 17 + index;
      context.fillRect(hash(seed, 1) * width, hash(seed, 2) * height, 1 + hash(seed, 3) * 2, 1 + hash(seed, 4) * 5);
    }
    context.restore();
  }
}

function drawLights(context, lights) {
  if (!lights.enabled) return;
  context.save();
  context.globalCompositeOperation = "screen";
  for (const point of lights.points) {
    const x = point.x * context.canvas.width;
    const y = point.y * context.canvas.height;
    const radius = Math.max(context.canvas.width, context.canvas.height) * point.radius / 100;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,235,205,${point.intensity / 100})`);
    gradient.addColorStop(1, "transparent");
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  context.restore();
}

function revealMask(context, sourceCanvas, maskCanvas, config) {
  if (!config.mask.enabled || !maskCanvas) return;
  const reveal = makeCanvas();
  sizeCanvas(reveal, context.canvas.width, context.canvas.height);
  const revealContext = reveal.getContext("2d");
  revealContext.drawImage(sourceCanvas, 0, 0);
  revealContext.globalCompositeOperation = config.mask.invert ? "destination-out" : "destination-in";
  revealContext.drawImage(maskCanvas, 0, 0, reveal.width, reveal.height);
  context.drawImage(reveal, 0, 0);
}

function createNoiseTexture(size = 96) {
  const canvas = makeCanvas();
  sizeCanvas(canvas, size, size);
  const context = canvas.getContext("2d");
  const imageData = context.createImageData(size, size);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const value = Math.floor(hash(index, 91) * 255);
    imageData.data[index] = value;
    imageData.data[index + 1] = value;
    imageData.data[index + 2] = value;
    imageData.data[index + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

export function createPortraitRenderer() {
  const sourceCanvas = makeCanvas();
  const backgroundCanvas = makeCanvas();
  const primitiveCanvas = makeCanvas();
  const adjustedCanvas = makeCanvas();
  const blurredCanvas = makeCanvas();
  const finalCanvas = makeCanvas();
  const scratchCanvas = makeCanvas();
  const noiseCanvas = createNoiseTexture();
  const matrixState = [];
  let samples = null;
  let maskCanvas = null;
  let currentWidth = 0;
  let currentHeight = 0;

  const contexts = {
    source: sourceCanvas.getContext("2d", { willReadFrequently: true }),
    background: backgroundCanvas.getContext("2d"),
    primitive: primitiveCanvas.getContext("2d"),
    adjusted: adjustedCanvas.getContext("2d"),
    blurred: blurredCanvas.getContext("2d"),
    final: finalCanvas.getContext("2d"),
    scratch: scratchCanvas.getContext("2d"),
  };

  const resize = (width, height) => {
    currentWidth = Math.max(1, Math.round(width));
    currentHeight = Math.max(1, Math.round(height));
    [sourceCanvas, backgroundCanvas, primitiveCanvas, adjustedCanvas, blurredCanvas, finalCanvas, scratchCanvas]
      .forEach((canvas) => sizeCanvas(canvas, currentWidth, currentHeight));
  };

  const setMask = async (dataUrl) => {
    maskCanvas = null;
    if (!dataUrl) return;
    const image = new Image();
    image.decoding = "async";
    image.src = dataUrl;
    try {
      await image.decode();
    } catch {
      return;
    }
    const canvas = makeCanvas();
    sizeCanvas(canvas, currentWidth, currentHeight);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, currentWidth, currentHeight);
    const imageData = context.getImageData(0, 0, currentWidth, currentHeight);
    const maskPixels = imageData.data;
    for (let index = 0; index < maskPixels.length; index += 4) {
      const luminance = (
        maskPixels[index] * 0.2126 +
        maskPixels[index + 1] * 0.7152 +
        maskPixels[index + 2] * 0.0722
      ) / 255;
      const alpha = maskPixels[index + 3];
      maskPixels[index] = 255;
      maskPixels[index + 1] = 255;
      maskPixels[index + 2] = 255;
      maskPixels[index + 3] = Math.round(luminance * alpha);
    }
    context.putImageData(imageData, 0, 0);
    maskCanvas = canvas;
  };

  return {
    async rebuild(image, width, height, config) {
      resize(width, height);
      contexts.source.clearRect(0, 0, currentWidth, currentHeight);
      const rect = getContainRect(
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
        currentWidth,
        currentHeight,
      );
      contexts.source.drawImage(image, rect.x, rect.y, rect.width, rect.height);
      samples = buildSamples(sourceCanvas, config);
      matrixState.length = 0;
      matrixState.rows = samples.rows;
      await setMask(config.mask.enabled ? config.mask.dataUrl : null);
    },

    draw(targetContext, config, time = 0) {
      if (!samples) return false;
      drawBackground(contexts.background, sourceCanvas, config);
      renderPrimitive(contexts.primitive, samples, config, time, matrixState);

      contexts.background.save();
      contexts.background.globalCompositeOperation = blendMode(config.styleBlend, "overlay");
      contexts.background.drawImage(primitiveCanvas, 0, 0);
      contexts.background.restore();

      applyColorAdjustments(contexts.adjusted, backgroundCanvas, config);
      applyConfiguredBlur(contexts.blurred, adjustedCanvas, config);
      contexts.final.clearRect(0, 0, currentWidth, currentHeight);
      contexts.final.drawImage(blurredCanvas, 0, 0);
      drawPostEffects(contexts.final, contexts.scratch, noiseCanvas, config, time);
      drawLights(contexts.final, config.lights);
      revealMask(contexts.final, sourceCanvas, maskCanvas, config);
      applySourceAlphaMask(contexts.final, sourceCanvas);

      targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
      targetContext.drawImage(finalCanvas, 0, 0, targetContext.canvas.width, targetContext.canvas.height);
      return true;
    },
  };
}
