import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getOrbitItemVisualState,
  getOrbitPresentation,
  getSafeActiveIndex,
  getSafeOrbitRadiusY,
  ORBIT_ACTIVE_SCALE,
} from "../utils/orbitLayout";

import "./OrbitImages.css";

function generateEllipsePath(centerX, centerY, radiusX, radiusY) {
  return `M ${centerX - radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 0 ${centerX + radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 0 ${centerX - radiusX} ${centerY}`;
}

function OrbitItem({
  item,
  index,
  totalItems,
  activeIndex,
  path,
  itemWidth,
  itemHeight,
  rotation,
  progress,
  fill,
  renderItem,
  reducedMotion,
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;
  const {
    circularOffset,
    distance,
    isActive,
    isVisible,
    opacity,
    scale,
    spreadX,
    tilt,
    zIndex,
  } = getOrbitItemVisualState(index, activeIndex, totalItems);

  const offsetDistance = useTransform(progress, (value) => {
    const offset = (((value + itemOffset) % 100) + 100) % 100;
    return `${offset}%`;
  });

  return (
    <motion.div
      className={`orbit-item ${isActive ? "is-active" : ""}`}
      style={{
        width: itemWidth,
        height: itemHeight,
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        offsetDistance,
        zIndex,
        pointerEvents: "none",
      }}
      animate={{ opacity }}
      transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden="false"
      data-orbit-distance={distance}
    >
      <motion.div
        className="orbit-item__content"
        animate={{
          rotate: -rotation + tilt,
          scale,
          x: spreadX,
        }}
        style={{ pointerEvents: "auto" }}
        transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {renderItem
          ? renderItem(item, index, {
              circularOffset,
              distance,
              isActive,
              isVisible,
            })
          : item}
      </motion.div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  items,
  renderItem,
  altPrefix = "Orbiting image",
  baseWidth = 1400,
  baseHeight = 760,
  radiusX = 590,
  radiusY = 220,
  rotation = -7,
  itemWidth = 320,
  itemHeight = 460,
  activeIndex = 0,
  activeOffset = 75,
  compactActiveOffset = 76,
  transitionDuration = 0.95,
  fill = true,
  className = "",
  showPath = false,
  pathColor = "rgba(255,255,255,0.08)",
  pathWidth = 1,
  responsive = true,
  compactBreakpoint = 720,
  compactBaseWidth = 700,
  compactBaseHeight = 620,
  compactRadiusX = 285,
  compactRadiusY = 150,
  compactItemWidth = 280,
  compactItemHeight = 400,
  orbitPadding = 44,
  compactOrbitPadding = 28,
  compactLayout = "orbit",
}) {
  const containerRef = useRef(null);
  const previousIndexRef = useRef(activeIndex);
  const continuousIndexRef = useRef(activeIndex);
  const latestActiveIndexRef = useRef(activeIndex);
  const [scale, setScale] = useState(responsive ? null : 1);
  const [compact, setCompact] = useState(
    () =>
      responsive &&
      typeof window !== "undefined" &&
      window.innerWidth <= compactBreakpoint,
  );
  const reducedMotion = useReducedMotion();

  const sourceItems = useMemo(() => {
    if (items) return items;
    return images.map((src, index) => (
      <img
        key={`${src}-${index}`}
        src={src}
        alt={`${altPrefix} ${index + 1}`}
        draggable={false}
        className="orbit-image"
      />
    ));
  }, [altPrefix, images, items]);

  const designWidth = compact ? compactBaseWidth : baseWidth;
  const designHeight = compact ? compactBaseHeight : baseHeight;
  const designRadiusX = compact ? compactRadiusX : radiusX;
  const designItemWidth = compact ? compactItemWidth : itemWidth;
  const designItemHeight = compact ? compactItemHeight : itemHeight;
  const designRadiusY = getSafeOrbitRadiusY({
    requestedRadiusY: compact ? compactRadiusY : radiusY,
    containerHeight: designHeight,
    itemHeight: designItemHeight,
    activeScale: ORBIT_ACTIVE_SCALE,
    padding: compact ? compactOrbitPadding : orbitPadding,
  });
  const designActiveOffset = compact ? compactActiveOffset : activeOffset;
  const totalItems = sourceItems.length;
  const safeActiveIndex = getSafeActiveIndex(activeIndex, totalItems);
  const presentation = getOrbitPresentation({
    compact,
    compactLayout,
    totalItems,
  });
  const gridItems = useMemo(() => {
    const indexedItems = sourceItems.map((item, index) => ({ item, index }));
    if (presentation !== "grid" || totalItems <= 0) return indexedItems;

    return [
      indexedItems[safeActiveIndex],
      ...indexedItems.filter(({ index }) => index !== safeActiveIndex),
    ];
  }, [presentation, safeActiveIndex, sourceItems, totalItems]);
  const centerX = designWidth / 2;
  const centerY = designHeight / 2;
  const path = useMemo(
    () => generateEllipsePath(centerX, centerY, designRadiusX, designRadiusY),
    [centerX, centerY, designRadiusX, designRadiusY],
  );
  const progress = useMotionValue(
    totalItems > 0
      ? designActiveOffset - (safeActiveIndex / totalItems) * 100
      : designActiveOffset,
  );

  latestActiveIndexRef.current = safeActiveIndex;

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return undefined;

    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const nextCompact = width <= compactBreakpoint;
      const nextDesignWidth = nextCompact ? compactBaseWidth : baseWidth;
      setCompact(nextCompact);
      setScale(width / nextDesignWidth);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [baseWidth, compactBaseWidth, compactBreakpoint, responsive]);

  useLayoutEffect(() => {
    const currentIndex = latestActiveIndexRef.current;
    previousIndexRef.current = currentIndex;
    continuousIndexRef.current = currentIndex;
    if (totalItems > 0) {
      progress.set(designActiveOffset - (currentIndex / totalItems) * 100);
    }
  }, [designActiveOffset, progress, totalItems]);

  useEffect(() => {
    if (totalItems <= 0 || presentation === "grid") return undefined;

    let delta = safeActiveIndex - previousIndexRef.current;
    if (delta > totalItems / 2) delta -= totalItems;
    if (delta < -totalItems / 2) delta += totalItems;

    continuousIndexRef.current += delta;
    previousIndexRef.current = safeActiveIndex;

    const target =
      designActiveOffset - (continuousIndexRef.current / totalItems) * 100;
    if (reducedMotion) {
      progress.set(target);
      return undefined;
    }

    const controls = animate(
      progress,
      target,
      {
        duration: transitionDuration,
        ease: [0.2, 0.8, 0.2, 1],
      },
    );

    return () => controls.stop();
  }, [
    designActiveOffset,
    presentation,
    progress,
    reducedMotion,
    safeActiveIndex,
    totalItems,
    transitionDuration,
  ]);

  if (presentation === "grid") {
    return (
      <div
        ref={containerRef}
        className={`orbit-container orbit-container--grid ${className}`.trim()}
        data-orbit-count={totalItems}
        data-orbit-layout="grid"
      >
        <div className="orbit-grid">
          {gridItems.map(({ item, index }) => {
            const state = getOrbitItemVisualState(
              index,
              safeActiveIndex,
              totalItems,
            );

            return (
              <div
                key={item?.id ?? item?.key ?? index}
                className={`orbit-grid-item ${state.isActive ? "is-active" : ""}`.trim()}
                data-orbit-distance={state.distance}
              >
                <div className="orbit-grid-item__content">
                  {renderItem
                    ? renderItem(item, index, state)
                    : item}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`.trim()}
      style={{ aspectRatio: `${designWidth} / ${designHeight}` }}
      data-orbit-count={totalItems}
      data-orbit-layout="orbit"
    >
      <div
        className={`orbit-scaling-container ${responsive ? "orbit-scaling-container--responsive" : ""}`.trim()}
        style={{
          width: designWidth,
          height: designHeight,
          transform:
            responsive && scale !== null
              ? `translate(-50%, -50%) scale(${scale})`
              : undefined,
          visibility: responsive && scale === null ? "hidden" : undefined,
        }}
      >
        <div
          className="orbit-rotation-wrapper"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {showPath ? (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${designWidth} ${designHeight}`}
              className="orbit-path-svg"
              aria-hidden="true"
            >
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / (scale ?? 1)}
              />
            </svg>
          ) : null}

          {sourceItems.map((item, index) => (
            <OrbitItem
              key={item?.id ?? item?.key ?? index}
              item={item}
              index={index}
              totalItems={totalItems}
              activeIndex={safeActiveIndex}
              path={path}
              itemWidth={designItemWidth}
              itemHeight={designItemHeight}
              rotation={rotation}
              progress={progress}
              fill={fill}
              renderItem={renderItem}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
