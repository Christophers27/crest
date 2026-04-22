"use client";

import { useState, useEffect, useCallback } from "react";

export function GridBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const maskStyle = {
    maskImage: `radial-gradient(circle 180px at ${mousePosition.x}px ${mousePosition.y}px, white, transparent)`,
    WebkitMaskImage: `radial-gradient(circle 180px at ${mousePosition.x}px ${mousePosition.y}px, white, transparent)`,
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line-highlight) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line-highlight) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          ...maskStyle,
        }}
      />
    </div>
  );
}
