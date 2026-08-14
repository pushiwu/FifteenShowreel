import { useLayoutEffect, useRef } from "react";
import { createSectionTimeline } from "../utils/motionSystem";

export default function SectionMotion({
  children,
  className = "",
  immediate = false,
  parallaxSelector = "",
  start = "top 82%",
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => createSectionTimeline(rootRef.current, {
    immediate,
    parallaxSelector,
    start,
  }), [immediate, parallaxSelector, start]);

  return (
    <div
      ref={rootRef}
      className={`section-motion ${className}`.trim()}
      data-revealed="waiting"
    >
      {children}
    </div>
  );
}
