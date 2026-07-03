import { useEffect } from "react";

export function useParallaxShift() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const curve = document.querySelector(".parabolic-curve");
      if (curve) {
        const moveX = (e.clientX - window.innerWidth / 2) / 100;
        const moveY = (e.clientY - window.innerHeight / 2) / 100;
        (curve as HTMLElement).style.transform = `translate(calc(-50% + ${moveX}px), ${moveY}px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);
}
