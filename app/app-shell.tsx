"use client";

import { useState } from "react";
import Image from "next/image";
import NavLinks from "./nav-links";

// 데스크톱에서는 사이드바가 항상 보이고, 폰 화면(sm 미만)에서는 햄버거 버튼으로
// 여닫는 오버레이 메뉴로 바뀐다. 사이드바 자체 구조(NavLinks)는 그대로 재사용한다
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 dark:border-white/5 dark:bg-[#1F242C] sm:hidden">
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label="메뉴 열기"
          className="text-slate-600 dark:text-slate-300"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-base font-bold text-slate-900 dark:text-white">
          의료장비 업무 도우미
        </span>
      </header>

      {isNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-black/5 bg-white px-5 py-6 transition-transform duration-200 dark:border-white/5 dark:bg-[#1F242C] sm:static sm:translate-x-0 ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="병원 로고" width={90} height={20} priority />
        </div>
        <div className="text-base font-bold text-slate-900 dark:text-white">
          의료장비 업무 도우미
        </div>
        <NavLinks onNavigate={() => setIsNavOpen(false)} />
      </aside>

      <div className="flex min-h-full flex-1 flex-col">{children}</div>
    </>
  );
}
