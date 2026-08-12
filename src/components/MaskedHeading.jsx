import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { gsap } from "gsap";

import "./MaskedHeading.css";

const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);

const MaskedHeading = ({
  text = "Designed in the details",
  tag = "h2",
  mediaType = "image",
  src = "",
  poster = "",
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  reveal = "rise",
  duration = 1.1,
  stagger = 0.09,
  trigger = "view",
  align = "center",
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  className = "",
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const measureRef = useRef(null);
  const revealRef = useRef(null);
  const mediaRef = useRef(null);
  const wordRefs = useRef([]);
  const baseRefs = useRef([]);
  const glyphRefs = useRef([]);
  const tweenRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const words = useMemo(() => String(text).split(/\s+/).filter(Boolean), [text]);

  const settingsRef = useRef({});
  settingsRef.current = {
    fillScale,
    parallax,
    drift,
    brightness,
    saturation,
    grayscale,
    textScale,
  };

  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;

    const settings = settingsRef.current;
    const width = root.clientWidth;
    const height = root.clientHeight;
    const offset = offsetRef.current;
    const maxX = Math.max(0, ((settings.fillScale - 1) / 2) * width);
    const maxY = Math.max(0, ((settings.fillScale - 1) / 2) * height);

    media.style.transform = `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(
      2,
    )}px, ${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${
      settings.fillScale
    })`;
    media.style.filter = `brightness(${settings.brightness}) saturate(${
      settings.saturation
    })${settings.grayscale ? " grayscale(1)" : ""}`;
  }, []);

  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;

    const settings = settingsRef.current;
    root.style.fontSize = `${clamp(
      root.clientWidth * settings.textScale,
      20,
      200,
    ).toFixed(1)}px`;

    const computedStyle = window.getComputedStyle(measure);
    for (let index = 0; index < wordRefs.current.length; index += 1) {
      const word = wordRefs.current[index];
      const base = baseRefs.current[index];
      const glyph = glyphRefs.current[index];
      if (!word || !base || !glyph) continue;

      glyph.setAttribute("x", `${word.offsetLeft}`);
      glyph.setAttribute("y", `${base.offsetTop}`);
      glyph.style.fontFamily = computedStyle.fontFamily;
      glyph.style.fontSize = computedStyle.fontSize;
      glyph.style.fontWeight = computedStyle.fontWeight;
      glyph.style.fontStyle = computedStyle.fontStyle;
      glyph.style.letterSpacing = computedStyle.letterSpacing;
    }

    place();
  }, [place]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    sync();
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(root);
    if (document.fonts?.ready) {
      document.fonts.ready.then(sync).catch(() => {});
    }

    let animationFrame = 0;
    let last = performance.now();
    let clock = 0;

    const frame = (now) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += delta;

      const settings = settingsRef.current;
      const offset = offsetRef.current;
      const driftX = Math.sin(clock * 0.21) * settings.drift;
      const driftY = Math.cos(clock * 0.17) * settings.drift * 0.6;
      const ease = 1 - Math.exp(-delta / 0.18);

      offset.x += (offset.tx + driftX - offset.x) * ease;
      offset.y += (offset.ty + driftY - offset.y) * ease;
      place();
      animationFrame = requestAnimationFrame(frame);
    };

    const onPointerMove = (event) => {
      const settings = settingsRef.current;
      if (settings.parallax <= 0) return;

      const bounds = root.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / (bounds.width || 1)) * 2 - 1;
      const normalizedY = ((event.clientY - bounds.top) / (bounds.height || 1)) * 2 - 1;
      offsetRef.current.tx = clamp(normalizedX, -1, 1) * -settings.parallax;
      offsetRef.current.ty = clamp(normalizedY, -1, 1) * -settings.parallax;
    };

    const onPointerLeave = () => {
      offsetRef.current.tx = 0;
      offsetRef.current.ty = 0;
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    animationFrame = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [place, sync]);

  useEffect(() => {
    sync();
  }, [align, lineHeight, tag, textScale, tracking, weight, words, sync]);

  useEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    if (!root || !layer) return undefined;

    const glyphs = glyphRefs.current.filter(Boolean);
    if (!glyphs.length) return undefined;

    const riseDistance = () =>
      (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15;

    const settle = () => {
      gsap.set(glyphs, { y: 0 });
      gsap.set(layer, {
        opacity: 1,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
      });
    };

    const rest = () => {
      if (reveal === "rise") {
        gsap.set(glyphs, { y: riseDistance() });
      } else if (reveal === "wipe") {
        gsap.set(layer, { clipPath: "inset(0% 100% 0% 0%)" });
      } else if (reveal === "fade") {
        gsap.set(layer, { opacity: 0, scale: 1.08 });
      }
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reveal === "none" || reducedMotion) {
      settle();
      return undefined;
    }

    const play = () => {
      tweenRef.current?.kill();

      if (reveal === "rise") {
        gsap.set(layer, {
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
        });
        tweenRef.current = gsap.fromTo(
          glyphs,
          { y: riseDistance() },
          {
            y: 0,
            duration,
            stagger,
            ease: "power4.out",
            overwrite: "auto",
          },
        );
      } else if (reveal === "wipe") {
        gsap.set(glyphs, { y: 0 });
        const state = { progress: 100 };
        tweenRef.current = gsap.to(state, {
          progress: 0,
          duration,
          ease: "power3.inOut",
          overwrite: "auto",
          onUpdate: () => {
            layer.style.clipPath = `inset(0% ${state.progress}% 0% 0%)`;
          },
        });
      } else {
        gsap.set(glyphs, { y: 0 });
        tweenRef.current = gsap.fromTo(
          layer,
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            duration,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }
    };

    if (trigger === "hover") {
      settle();
      root.addEventListener("pointerenter", play);
      return () => {
        root.removeEventListener("pointerenter", play);
        tweenRef.current?.kill();
      };
    }

    if (trigger === "view") {
      settle();
      rest();
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play();
            observer.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(root);

      return () => {
        observer.disconnect();
        tweenRef.current?.kill();
      };
    }

    play();
    return () => tweenRef.current?.kill();
  }, [duration, reveal, stagger, trigger, words]);

  const Tag = tag;

  return (
    <Tag
      ref={rootRef}
      className={`masked-heading ${className}`.trim()}
      style={{
        textAlign: align,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        lineHeight,
        ...style,
      }}
      {...rest}
    >
      <span ref={measureRef} className="masked-heading__measure">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            ref={(element) => {
              wordRefs.current[index] = element;
            }}
            className="masked-heading__word"
          >
            {word}
            <i
              ref={(element) => {
                baseRefs.current[index] = element;
              }}
              className="masked-heading__baseline"
            />
          </span>
        ))}
      </span>

      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, index) => (
              <text
                key={`${word}-${index}`}
                ref={(element) => {
                  glyphRefs.current[index] = element;
                }}
              >
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <span ref={revealRef} className="masked-heading__reveal">
        <span
          className="masked-heading__clip"
          style={{ clipPath: `url(#${clipId})` }}
        >
          <span ref={mediaRef} className="masked-heading__media">
            {mediaType === "video" ? (
              <video
                className="masked-heading__source"
                src={src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />
            ) : (
              <img
                className="masked-heading__source"
                src={src}
                alt=""
                draggable={false}
              />
            )}
          </span>
        </span>
      </span>
    </Tag>
  );
};

export default MaskedHeading;
