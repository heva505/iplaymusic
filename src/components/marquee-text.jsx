"use client";

import { useRef, useEffect, useState } from "react";

export default function MarqueeText({ name, className = "" }) {
  const ref = useRef(null);
  const [isOverflowing, setOverflowing] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.scrollWidth > ref.current.clientWidth) {
      setOverflowing(true);
    }
  }, [name]);

  return (
    <span
      ref={ref}
      className={`marquee-text ${className} ${
        isOverflowing ? "overflowing" : ""
      }`}
      title={typeof name === "string" ? name : name?.join(", ")}
    >
      {typeof name === "string" ? name : name?.join(", ")}
    </span>
  );
}
