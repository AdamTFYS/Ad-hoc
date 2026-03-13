"use client";

import dynamic from "next/dynamic";

const ColorBends = dynamic(() => import("./ColorBends"), { ssr: false });

const AUTH_COLORS = ["#6366f1", "#818cf8", "#4f46e5", "#a855f7"];

export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <ColorBends
          colors={AUTH_COLORS}
          speed={0.2}
          noise={0.05}
          transparent={false}
        />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}
