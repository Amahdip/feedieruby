"use client";

import { useEffect, useRef } from "react";

/**
 * Animated hero background: a slowly drifting "aurora" mesh gradient + a
 * mouse-reactive particle network that fans up from the bottom-center.
 * Pure CSS gradients + a single <canvas> (no WebGL/3D deps) → ~60fps, RTL-safe,
 * light on mobile. Decorative only (aria-hidden, pointer-events-none).
 */
export function HeroAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    let pts: { x: number; y: number; bx: number; by: number; vx: number; vy: number; r: number }[] = [];

    const build = () => {
      pts = [];
      const origin = { x: W * 0.5, y: H + 30 };
      const N = Math.round(Math.min(110, W / 12));
      for (let i = 0; i < N; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.05;
        const len = Math.random() * H * 1.05;
        const x = origin.x + Math.cos(ang) * len * (0.8 + Math.random() * 0.5);
        const y = origin.y + Math.sin(ang) * len;
        pts.push({
          x,
          y,
          bx: x,
          by: y,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    };

    const size = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        p.x += (p.bx - p.x) * 0.01;
        p.y += (p.by - p.y) * 0.01;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          const f = (1 - d2 / 14000) * 2.2;
          const d = Math.sqrt(d2 + 1);
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }
      for (let a = 0; a < pts.length; a++) {
        for (let b = a + 1; b < pts.length; b++) {
          const p = pts[a];
          const q = pts[b];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.strokeStyle = `rgba(214,204,255,${(1 - dist / 80) * 0.45})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const glow = md < 120 ? 1 - md / 120 : 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${255 - glow * 40},255,${0.5 + glow * 0.45})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener("resize", size);
    if (!reduce) {
      window.addEventListener("mousemove", onMove);
      wrap.addEventListener("mouseleave", onLeave);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes frDrift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(80px,60px) scale(1.12)}}
        @keyframes frDrift2{0%,100%{transform:translate(0,0) scale(1.05)}50%{transform:translate(-70px,70px) scale(.92)}}
        @keyframes frDrift3{0%,100%{transform:translate(-50%,0) scale(1)}50%{transform:translate(-42%,-40px) scale(1.1)}}
      `}</style>
      <div
        className="absolute -left-32 -top-44 h-[560px] w-[560px] rounded-full opacity-70 mix-blend-screen blur-[70px]"
        style={{
          background: "radial-gradient(circle,#7C3AED,transparent 62%)",
          animation: "frDrift1 16s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-28 -top-28 h-[520px] w-[520px] rounded-full opacity-70 mix-blend-screen blur-[70px]"
        style={{
          background: "radial-gradient(circle,#2563EB,transparent 62%)",
          animation: "frDrift2 19s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-72 left-[30%] h-[620px] w-[620px] rounded-full opacity-70 mix-blend-screen blur-[70px]"
        style={{
          background:
            "radial-gradient(circle,#06B6D4,transparent 60%),radial-gradient(circle at 70% 30%,#EC4899,transparent 60%)",
          animation: "frDrift3 22s ease-in-out infinite",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
