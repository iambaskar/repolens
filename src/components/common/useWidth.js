import { useState, useEffect } from "react";

export function useWidth(ref) {
  const [width, setWidth] = useState(400);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}