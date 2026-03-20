import React from 'react';

export default function Topbar() {
  return (
    <header className="
      sticky top-0 z-50 flex items-center gap-4 px-6 h-14
      bg-bg/90 border-b border-white/7 backdrop-blur-xl
    ">
      {/* Logo */}
      <div className="flex items-center gap-2 font-syne font-extrabold text-lg">
        Script<span className="text-accent">Forge</span>
      </div>
    </header>
  );
}
