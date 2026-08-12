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

import "./OrbitImages.css";

function generateEllipsePath(centerX, centerY, radiusX, radiusY) {
  return `M ${centerX - radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 0 ${centerX + radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 0 ${centerX - radiusX} ${centerY}`;
}

function getCircularOffset(index, activeIndex, total) {
  if (total <= 0) return 0;
  const raw = index - activeIndex;
  return ((raw + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);
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
  visibleRadius,
  renderItem,
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;
  const circularOffset = getCircularOffset(index, activeIndex, totalItems);
  const distance = Math.abs(circularOffset);
  const isActive = distance === 0;
  const isVisible = distance <= visibleRadius;
  const scale = Math.max(0.58, 1 - distance * 0.115);
  const opacity = isVisible ? Math.max(0.18, 1 - distance * 0.2) : 0;
  const tilt = circularOffset === 0 ? 0 : Math.sign(circularOffset) * Math.min(16, 5 + distance * 2.5);

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
        zIndex: totalItems - distance,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      animate={{ opacity }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden={!isVisible}
    >
      <motion.div
        className="orbit-item__content"
        animate={{
          rotate: -rotation + tilt,
          scale: isActive ? 1.04 : scale,
        }}
        transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
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
  visibleRadius = 4,
  compactBreakpoint = 720,
  compactBaseWidth = 700,
  compactBaseHeight = 620,
  compactRadiusX = 285,
  compactRadiusY = 150,
  compactItemWidth = 280,
  compactItemHeight = 400,
}) {
  const containerRef = useRef(null);
  const previousIndexRef = useRef(activeIndex);
  const continuousIndexRef = useRef(activeIndex);
  const latestActiveIndexRef = useRef(activeIndex);
  const [scale, setScale] = useState(responsive ? null : 1);
  const [compact, setCompact] = useState(false);
  const reducedMotion = useReducedMotion();

  latestActiveIndexRef.current = activeIndex;

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
  const designRadiusY = compact ? compactRadiusY : radiusY;
  const designItemWidth = compact ? compactItemWidth : itemWidth;
  const designItemHeight = compact ? compactItemHeight : itemHeight;
  const designActiveOffset = compact ? compactActiveOffset : activeOffset;
  const totalItems = sourceItems.length;
  const centerX = designWidth / 2;
  const centerY = designHeight / 2;
  const path = useMemo(
    () => generateEllipsePath(centerX, centerY, designRadiusX, designRadiusY),
    [centerX, centerY, designRadiusX, designRadiusY],
  );
  const progress = useMotionValue(
    totalItems > 0
      ? designActiveOffset - (activeIndex / totalItems) * 100
      : designActiveOffset,
  );

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
    if (totalItems <= 0) return undefined;

    let delta = activeIndex - previousIndexRef.current;
    if (delta > totalItems / 2) delta -= totalItems;
    if (delta < -totalItems / 2) delta += totalItems;

    continuousIndexRef.current += delta;
    previousIndexRef.current = activeIndex;

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
    activeIndex,
    designActiveOffset,
    progress,
    reducedMotion,
    totalItems,
    transitionDuration,
  ]);

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`.trim()}
      style={{ aspectRatio: `${designWidth} / ${designHeight}` }}
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
              key={item?.key ?? index}
              item={item}
              index={index}
              totalItems={totalItems}
              activeIndex={activeIndex}
              path={path}
              itemWidth={designItemWidth}
              itemHeight={designItemHeight}
              rotation={rotation}
              progress={progress}
              fill={fill}
              visibleRadius={visibleRadius}
              renderItem={renderItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
