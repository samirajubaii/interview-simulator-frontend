import { useEffect, useState } from "react";

export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isSmallMobile = width < 480;

  return { width, isMobile, isTablet, isDesktop, isSmallMobile };
}

/** Returns a CSS grid-template-columns value for responsive grids. */
export function gridCols({ xs = 1, sm, md, lg }, bp) {
  if (bp.isSmallMobile) return `repeat(${xs}, 1fr)`;
  if (bp.isMobile) return `repeat(${sm ?? xs}, 1fr)`;
  if (bp.isTablet) return `repeat(${md ?? sm ?? xs}, 1fr)`;
  return `repeat(${lg ?? md ?? sm ?? xs}, 1fr)`;
}
