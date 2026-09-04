"use client";
// localStorage에 저장된 장비 목록을 읽고, 아직 2026학년도 심의자료가 한 번도
// 들어온 적 없으면 public/seed-2026.json을 자동으로 불러와 합쳐준다.
// (수동으로 "심의자료 가져오기" 버튼을 누르지 않아도 항상 데이터가 있도록 하기 위함)
import { useEffect, useState } from "react";
import type { Equipment } from "./equipment";
import { loadEquipments, mergeEquipments, saveEquipments } from "./storage";

const SEED_URL = "/api/seed";
const SEED_LOADED_KEY = "equipment-checklist-seed-2026-loaded";

export function useEquipments(): [Equipment[], (next: Equipment[]) => void] {
  const [equipments, setEquipmentsState] = useState<Equipment[]>(() => loadEquipments());

  useEffect(() => {
    if (window.localStorage.getItem(SEED_LOADED_KEY)) return;

    fetch(SEED_URL)
      .then((res) => res.json())
      .then((seedItems: Equipment[]) => {
        setEquipmentsState((current) => {
          const merged = mergeEquipments(current, seedItems);
          saveEquipments(merged);
          return merged;
        });
        window.localStorage.setItem(SEED_LOADED_KEY, "true");
      })
      .catch(() => {
        // seed-2026.json이 없으면 그냥 빈 상태로 둔다
      });
  }, []);

  function setEquipments(next: Equipment[]) {
    setEquipmentsState(next);
    saveEquipments(next);
  }

  return [equipments, setEquipments];
}
