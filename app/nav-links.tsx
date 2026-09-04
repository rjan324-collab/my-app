"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 여러 업무 섹션을 모으는 사이드바 nav. 지금은 "장비 입고 체크리스트" 섹션 하나와
// 그 안에 "2026학년도" 하나를 담은 "의료장비 심의 통과" 그룹이 있다.
// 앞으로 다른 업무 섹션이 늘어나면 이 배열에 항목만 추가하면 된다.
type NavItem = { href: string; label: string };
type NavEntry = NavItem | { label: string; items: NavItem[] };

const NAV_ENTRIES: NavEntry[] = [
  { href: "/", label: "장비 입고 체크리스트" },
  {
    label: "의료장비 심의 통과",
    items: [{ href: "/review/2026", label: "2026학년도" }],
  },
];

function isNavItem(entry: NavEntry): entry is NavItem {
  return "href" in entry;
}

export default function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4">
      {NAV_ENTRIES.map((entry) => {
        if (isNavItem(entry)) {
          const active = pathname === entry.href;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={onNavigate}
              className={`rounded-xl px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-[#E8F3FF] text-[#3182F6] dark:bg-[#1B2C44]"
                  : "text-slate-600 hover:bg-[#F2F4F6] dark:text-slate-300 dark:hover:bg-[#171B22]"
              }`}
            >
              {entry.label}
            </Link>
          );
        }

        return (
          <div key={entry.label} className="flex flex-col gap-1">
            <span className="px-3 text-xs font-semibold text-slate-400">{entry.label}</span>
            {entry.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-[#E8F3FF] text-[#3182F6] dark:bg-[#1B2C44]"
                      : "text-slate-600 hover:bg-[#F2F4F6] dark:text-slate-300 dark:hover:bg-[#171B22]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
