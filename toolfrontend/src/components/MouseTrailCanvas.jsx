import { useEffect, useRef } from "react";

const MouseTrailCanvas = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      particlesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        size: 8,
        opacity: 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        p.size *= 0.94;
        p.opacity -= 0.02;

        if (p.opacity <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.shadowBlur = 20;
         ctx.fillStyle = `rgba(10, 10, 10, ${p.opacity})`;
ctx.shadowColor = 'rgba(60, 60, 60, 0.45)';
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup (VERY IMPORTANT)
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-100"
    />
  );
};

export default MouseTrailCanvas;
