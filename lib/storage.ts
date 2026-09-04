// 장비 건 데이터를 브라우저 localStorage에 저장·불러오는 기능 (PLAN.md 7번 작업)
import type { Equipment } from "./equipment";

const STORAGE_KEY = "equipment-checklist";

export function loadEquipments(): Equipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Equipment[];
  } catch {
    return [];
  }
}

export function saveEquipments(equipments: Equipment[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(equipments));
}

// 심의자료 등 외부에서 가져온 장비 건을 기존 목록에 합친다. id가 같으면 덮어쓰고, 새 id면 추가한다
export function mergeEquipments(existing: Equipment[], incoming: Equipment[]): Equipment[] {
  const merged = [...existing];
  incoming.forEach((item) => {
    const index = merged.findIndex((existingItem) => existingItem.id === item.id);
    if (index === -1) {
      merged.push(item);
    } else {
      merged[index] = item;
    }
  });
  return merged;
}
