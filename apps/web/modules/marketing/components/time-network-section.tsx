"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reusable background: a radial fiber burst (hundreds of filaments fanning up
 * from a point at the bottom) combed by the cursor, on a dark base so overlaid
 * content stays readable. The filament palette is chosen automatically from the
 * visitor's local time of day (pre-dawn → night); the corner menu overrides it.
 * Pure <canvas> (no WebGL deps); honours prefers-reduced-motion.
 */
type ThemeKey = "preDawn" | "sunrise" | "daytime" | "dusk" | "sunset" | "night";

interface Theme {
  bg: string;
  core: string;
  tip: string;
  dot: string;
  /** readable heading color for this palette (shared with overlaid content) */
  ink: string;
}

// Real time-of-day palettes: light & soft for day/dawn/dusk, deep for night.
const THEMES: Record<ThemeKey, Theme> = {
  preDawn: {
    bg: "radial-gradient(130% 115% at 50% 100%,#26305c,#0b0e22)",
    core: "#a9a0f0",
    tip: "#5566b0",
    dot: "#c3c8ff",
    ink: "#e7eaff",
  },
  sunrise: {
    bg: "radial-gradient(130% 115% at 50% 100%,#ffd9c2,#f7e8f1)",
    core: "#fb7185",
    tip: "#f59e0b",
    dot: "#e11d48",
    ink: "#831843",
  },
  daytime: {
    bg: "radial-gradient(130% 115% at 50% 100%,#bcdcff,#eef6ff)",
    core: "#2563eb",
    tip: "#60a5fa",
    dot: "#1d4ed8",
    ink: "#1e3a8a",
  },
  dusk: {
    bg: "radial-gradient(130% 115% at 50% 100%,#e3d2f3,#f0e8f8)",
    core: "#9333ea",
    tip: "#7c3aed",
    dot: "#c026d3",
    ink: "#5b21b6",
  },
  sunset: {
    bg: "radial-gradient(130% 115% at 50% 100%,#ffd0b0,#e7d2f0)",
    core: "#f97316",
    tip: "#a855f7",
    dot: "#db2777",
    ink: "#7e22ce",
  },
  night: {
    bg: "radial-gradient(130% 115% at 50% 100%,#101a44,#05060f)",
    core: "#34d3ee",
    tip: "#7c5cff",
    dot: "#7ef0ff",
    ink: "#dbe3ff",
  },
};

function autoKey(): ThemeKey {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 7) return "preDawn";
  if (h < 9) return "sunrise";
  if (h < 17) return "daytime";
  if (h < 19) return "dusk";
  if (h < 21) return "sunset";
  return "night";
}

export function TimeNetworkBackground() {
  const [themeKey, setThemeKey] = useState<ThemeKey>("night");
  const themeRef = useRef<ThemeKey>("night");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const k = autoKey();
    setThemeKey(k);
    themeRef.current = k;
  }, []);
  useEffect(() => {
    themeRef.current = themeKey;
    // share the palette's readable heading color with the overlaid section content
    const section = wrapRef.current?.parentElement;
    if (section) section.style.setProperty("--tn-ink", THEMES[themeKey].ink);
  }, [themeKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const R = 150; // brush radius in CSS px
    let W = 0;
    let H = 0;
    let raf = 0;
    const origin = { x: 0, y: 0 };
    const mouse = { x: -9999, y: -9999 };
    // bx/by = rest endpoint, x/y = live endpoint (springs back, repelled by cursor)
    let fibers: { bx: number; by: number; x: number; y: number; dot: number }[] = [];

    const build = () => {
      fibers = [];
      const N = Math.round(Math.min(460, W / 2.8));
      for (let i = 0; i < N; i++) {
        const a = -Math.PI + (i / (N - 1)) * Math.PI + (Math.random() - 0.5) * 0.018;
        // lengths span the whole radius so dots populate center → edge
        const L = (0.1 + Math.pow(Math.random(), 0.6)) * H * 1.05;
        const bx = origin.x + Math.cos(a) * L;
        const by = origin.y + Math.sin(a) * L;
        fibers.push({ bx, by, x: bx, y: by, dot: Math.random() * 1.6 + 0.8 });
      }
    };
    const size = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      origin.x = W * 0.5;
      origin.y = H + 8;
      build();
    };
    // Listen on window so movement over the overlaid cards still drives the brush.
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    const frame = () => {
      const th = THEMES[themeRef.current];
      ctx.clearRect(0, 0, W, H);

      const g = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, H * 0.6);
      g.addColorStop(0, th.core);
      g.addColorStop(0.16, th.core + "99");
      g.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.38;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      for (let i = 0; i < fibers.length; i++) {
        const f = fibers[i];
        // spring the live endpoint back to its rest position
        f.x += (f.bx - f.x) * 0.08;
        f.y += (f.by - f.y) * 0.08;
        // positional brush: physically push the endpoint away from the cursor
        const dx = f.x - mouse.x;
        const dy = f.y - mouse.y;
        const d = Math.hypot(dx, dy);
        let glow = 0;
        if (d < R) {
          glow = 1 - d / R;
          if (!reduce) {
            const force = glow * glow * 28;
            f.x += (dx / (d + 0.01)) * force;
            f.y += (dy / (d + 0.01)) * force;
          }
        }
        const lg = ctx.createLinearGradient(origin.x, origin.y, f.x, f.y);
        lg.addColorStop(0, th.core);
        lg.addColorStop(0.55, th.core);
        lg.addColorStop(1, th.tip);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 0.85 + glow * 1.4;
        ctx.globalAlpha = 0.8 + glow * 0.2;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();
        ctx.globalAlpha = 0.9 + glow * 0.1;
        ctx.fillStyle = th.dot;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.dot + glow * 2.4, 0, 6.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener("resize", size);
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const theme = THEMES[themeKey];

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ background: theme.bg, transition: "background .8s ease" }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
