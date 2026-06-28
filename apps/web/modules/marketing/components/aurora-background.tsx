"use client";

/**
 * Soft, dynamically-flowing "northern lights" background. Several large blurred
 * gradient blobs (including tall "curtain" streaks) drift, sway, scale and
 * shimmer in opacity on independent timings and blend additively
 * (mix-blend-screen) over a dark surface — so it reads like real aurora in
 * motion. Pure CSS (no JS/canvas); decorative + pointer-events-none.
 * CSS animations keep running even when JS rAF is throttled.
 */
export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <style>{`
        @keyframes frAurA{0%,100%{transform:translate(-12%,2%) rotate(-5deg) scale(1);opacity:.5}50%{transform:translate(16%,12%) rotate(9deg) scale(1.28);opacity:.85}}
        @keyframes frAurB{0%,100%{transform:translate(14%,-6%) rotate(4deg) scale(1.15);opacity:.45}50%{transform:translate(-18%,12%) rotate(-9deg) scale(.9);opacity:.8}}
        @keyframes frAurC{0%,100%{transform:translate(-6%,8%) scale(1);opacity:.4}50%{transform:translate(12%,-12%) scale(1.32);opacity:.75}}
        @keyframes frAurD{0%,100%{transform:translate(8%,-4%) scale(1.05);opacity:.35}50%{transform:translate(-14%,9%) scale(.85);opacity:.7}}
        @keyframes frCurtain1{0%,100%{transform:translateX(-30%) skewX(-8deg) scaleY(1);opacity:.35}50%{transform:translateX(40%) skewX(10deg) scaleY(1.25);opacity:.7}}
        @keyframes frCurtain2{0%,100%{transform:translateX(35%) skewX(7deg) scaleY(1.2);opacity:.3}50%{transform:translateX(-35%) skewX(-9deg) scaleY(.9);opacity:.6}}
      `}</style>
      {/* drifting blobs */}
      <div
        className="absolute -left-1/4 -top-1/3 h-[150%] w-[55%] mix-blend-screen blur-[90px]"
        style={{
          background: "radial-gradient(closest-side,#34d399,transparent 70%)",
          animation: "frAurA 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-1/4 -top-1/4 h-[150%] w-[50%] mix-blend-screen blur-[100px]"
        style={{
          background: "radial-gradient(closest-side,#7c3aed,transparent 70%)",
          animation: "frAurB 15s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[20%] top-[6%] h-[140%] w-[55%] mix-blend-screen blur-[90px]"
        style={{
          background: "radial-gradient(closest-side,#22d3ee,transparent 70%)",
          animation: "frAurC 13s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -top-[5%] left-[40%] h-[140%] w-[45%] mix-blend-screen blur-[110px]"
        style={{
          background: "radial-gradient(closest-side,#ec4899,transparent 70%)",
          animation: "frAurD 17s ease-in-out infinite",
        }}
      />
      {/* tall swaying "curtains" */}
      <div
        className="absolute -top-1/4 left-[10%] h-[160%] w-[26%] mix-blend-screen blur-[70px]"
        style={{
          background: "radial-gradient(closest-side,#2dd4bf,transparent 72%)",
          animation: "frCurtain1 10s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -top-1/4 right-[12%] h-[160%] w-[24%] mix-blend-screen blur-[70px]"
        style={{
          background: "radial-gradient(closest-side,#a78bfa,transparent 72%)",
          animation: "frCurtain2 14s ease-in-out infinite",
        }}
      />
    </div>
  );
}
