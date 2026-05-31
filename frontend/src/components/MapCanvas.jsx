import { useEffect, useRef } from "react";

/**
 * Lightweight canvas-based map placeholder.
 * Renders a stylised grid + route + pickup/drop pins + driver marker.
 * Avoids external API keys. Looks premium and dynamic.
 */
export const MapCanvas = ({
  pickup,
  drop,
  driver,
  className = "",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, rect.width, rect.height);
    };

    const draw = (ctx, W, H) => {
      const isDark = document.documentElement.classList.contains("dark");
      // bg
      ctx.fillStyle = isDark ? "#0B0F14" : "#EAF1F8";
      ctx.fillRect(0, 0, W, H);

      // soft radial highlights
      const grd1 = ctx.createRadialGradient(W * 0.25, H * 0.3, 10, W * 0.25, H * 0.3, W * 0.5);
      grd1.addColorStop(0, isDark ? "rgba(56,123,234,0.18)" : "rgba(10,46,109,0.10)");
      grd1.addColorStop(1, "transparent");
      ctx.fillStyle = grd1;
      ctx.fillRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(10,46,109,0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // some "roads"
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(10,46,109,0.10)";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      const roads = [
        [[W*0.1, H*0.85], [W*0.55, H*0.6], [W*0.9, H*0.2]],
        [[0, H*0.3], [W*0.4, H*0.45], [W*0.8, H*0.9]],
        [[W*0.2, 0], [W*0.3, H*0.4], [W*0.7, H*0.5], [W, H*0.4]],
      ];
      roads.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r[0][0], r[0][1]);
        for (let i = 1; i < r.length; i++) ctx.lineTo(r[i][0], r[i][1]);
        ctx.stroke();
      });

      // route between pickup and drop (simulated)
      const p = pickup ? [W*0.22, H*0.7] : null;
      const d = drop ? [W*0.78, H*0.28] : null;
      if (p && d) {
        ctx.strokeStyle = "#FF7A00";
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.bezierCurveTo(W*0.4, H*0.7, W*0.55, H*0.25, d[0], d[1]);
        ctx.stroke();
      }

      // pickup pin
      if (p) {
        ctx.fillStyle = "#0A2E6D";
        ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI*2); ctx.fill();
      }
      // drop pin
      if (d) {
        ctx.fillStyle = "#FF7A00";
        ctx.beginPath(); ctx.arc(d[0], d[1], 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(d[0], d[1], 4, 0, Math.PI*2); ctx.fill();
      }
      // driver
      if (driver) {
        const dx = W*0.45, dy = H*0.5;
        ctx.fillStyle = "#16A34A";
        ctx.beginPath(); ctx.arc(dx, dy, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "rgba(22,163,74,0.35)";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(dx, dy, 18, 0, Math.PI*2); ctx.stroke();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    const observer = new MutationObserver(resize);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { window.removeEventListener("resize", resize); observer.disconnect(); };
  }, [pickup, drop, driver]);

  return <canvas ref={ref} className={`block w-full h-full ${className}`} data-testid="map-canvas" />;
};
