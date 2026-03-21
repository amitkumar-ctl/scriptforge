import React from 'react';
import UserMenu from './auth/UserMenu';

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 px-6 h-14
                       bg-bg/90 border-b border-white/7 backdrop-blur-xl">
      <div className="flex items-center gap-2 font-syne font-extrabold text-lg">
        <div className="w-7 h-7 rounded-md bg-gradient-accent flex items-center justify-center text-sm text-bg">✦</div>
        Script<span className="text-accent">Forge</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full
                         bg-accent/10 text-accent border border-accent/20 hidden sm:inline-block">
          Microfrontend
        </span>
        <UserMenu />
      </div>
    </header>
  );
}
