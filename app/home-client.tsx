"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CHECKLIST_STAGES,
  createEquipment,
  isEquipmentCompleted,
  PURCHASE_TYPE_OPTIONS,
  REVIEW_STATUS_OPTIONS,
  type PurchaseType,
  type ReviewStatus,
} from "@/lib/equipment";
import { useEquipments } from "@/lib/use-equipments";

type Filter = "all" | "inProgress" | "completed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "inProgress", label: "진행 중" },
  { key: "completed", label: "완료" },
];

const EMPTY_FORM = {
  nameKo: "",
  nameEn: "",
  department: "",
  reviewStatus: "reviewed" as ReviewStatus,
  purchaseType: "purchase" as PurchaseType,
  academicYear: "2026",
  vendorName: "",
  vendorContact: "",
  modelName: "",
  listPrice: "",
};

const INPUT_CLASS =
  "rounded-xl border-none bg-[#F2F4F6] px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22] dark:text-white";

export default function Home() {
  // 이 페이지는 next/dynamic(ssr:false)로만 렌더링되므로 브라우저에서만 실행된다
  const [equipments, setEquipments] = useEquipments();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState(EMPTY_FORM);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleRegister() {
    if (!form.nameKo.trim() && !form.nameEn.trim()) return;
    setEquipments([
      ...equipments,
      createEquipment({
        nameKo: form.nameKo.trim(),
        nameEn: form.nameEn.trim(),
        department: form.department.trim(),
        reviewStatus: form.reviewStatus,
        purchaseType: form.purchaseType,
        academicYear: form.academicYear.trim(),
        vendorName: form.vendorName.trim(),
        vendorContact: form.vendorContact.trim(),
        modelName: form.modelName.trim(),
        listPrice: Number(form.listPrice) || 0,
      }),
    ]);
    setForm(EMPTY_FORM);
    setIsRegisterOpen(false);
  }

  function handleDelete(id: string, displayName: string) {
    // 서버 백업 없이 브라우저에만 저장되는 데이터라, 잘못 눌러 지우면 되돌릴 방법이 없다
    if (!window.confirm(`"${displayName}" 건을 삭제하시겠습니까? 되돌릴 수 없습니다.`)) return;
    setEquipments(equipments.filter((equipment) => equipment.id !== id));
  }

  const visibleEquipments = equipments.filter((equipment) => {
    if (filter === "inProgress") return !isEquipmentCompleted(equipment);
    if (filter === "completed") return isEquipmentCompleted(equipment);
    return true;
  });

  return (
    <div className="flex flex-1 flex-col bg-[#F2F4F6] dark:bg-[#171B22]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
            현황판
          </h1>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="rounded-2xl bg-[#3182F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2272eb]"
          >
            새 장비 건 등록
          </button>
        </header>

        <div className="flex gap-2 text-sm">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                filter === tab.key
                  ? "bg-[#3182F6] text-white"
                  : "bg-white text-slate-500 dark:bg-[#1F242C] dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visibleEquipments.length === 0 && (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-slate-400 dark:bg-[#1F242C]">
            등록된 장비 건이 없습니다.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {visibleEquipments.map((equipment) => {
            const total = CHECKLIST_STAGES.length;
            const checkedCount = CHECKLIST_STAGES.filter(
              (stage) => equipment.stageChecked[stage.id],
            ).length;
            const currentStage =
              CHECKLIST_STAGES.find((stage) => !equipment.stageChecked[stage.id]) ??
              CHECKLIST_STAGES[total - 1];
            const completed = isEquipmentCompleted(equipment);
            const isReviewed = equipment.reviewStatus === "reviewed";
            const displayName = [equipment.nameKo, equipment.nameEn]
              .filter(Boolean)
              .join(" · ") || "(이름 없음)";

            return (
              <li
                key={equipment.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md dark:bg-[#1F242C]"
              >
                <Link href={`/equipment/${equipment.id}`} className="flex flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </span>
                    {equipment.department && (
                      <span className="text-sm text-slate-400">{equipment.department}</span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isReviewed
                          ? "bg-[#E8F3FF] text-[#3182F6]"
                          : "bg-[#FFF4E5] text-[#F59E0B]"
                      }`}
                    >
                      {REVIEW_STATUS_OPTIONS.find((option) => option.id === equipment.reviewStatus)
                        ?.label}
                    </span>
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {[
                      equipment.vendorName,
                      equipment.modelName,
                      equipment.listPrice ? `${equipment.listPrice.toLocaleString()}원` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="text-sm text-slate-400">
                    {checkedCount}/{total}{" "}
                    <span className="font-medium text-[#3182F6]">{currentStage.label}</span>
                  </span>
                </Link>
                <div className="flex items-center gap-3">
                  {completed && (
                    <span className="flex flex-col items-end gap-0.5">
                      <span className="rounded-full bg-[#E9FBF0] px-2.5 py-1 text-xs font-semibold text-[#1DB67D]">
                        완료
                      </span>
                      {equipment.receivedAt && (
                        <span className="text-xs text-slate-400">{equipment.receivedAt} 입고</span>
                      )}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(equipment.id, displayName)}
                    className="text-sm text-slate-300 hover:text-red-500"
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      {isRegisterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col gap-6 overflow-y-auto rounded-3xl bg-white p-7 shadow-xl dark:bg-[#1F242C]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                새 장비 건 등록
              </h2>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                aria-label="닫기"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  장비명 (한글)
                  <input
                    type="text"
                    value={form.nameKo}
                    onChange={(event) => updateForm("nameKo", event.target.value)}
                    placeholder="예: 초음파 진단기"
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  장비명 (영어)
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(event) => updateForm("nameEn", event.target.value)}
                    placeholder="예: Ultrasound Scanner"
                    className={INPUT_CLASS}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                담당 진료과
                <input
                  type="text"
                  value={form.department}
                  onChange={(event) => updateForm("department", event.target.value)}
                  placeholder="예: 영상의학과"
                  className={INPUT_CLASS}
                />
              </label>
              <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                심의 구분
                <div className="flex gap-4 pt-1">
                  {REVIEW_STATUS_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-1.5 font-normal">
                      <input
                        type="radio"
                        name="reviewStatus"
                        checked={form.reviewStatus === option.id}
                        onChange={() => updateForm("reviewStatus", option.id)}
                        className="accent-[#3182F6]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                장비 구분 (정책 / 구입 / 임대)
                <div className="flex gap-4 pt-1">
                  {PURCHASE_TYPE_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-1.5 font-normal">
                      <input
                        type="radio"
                        name="purchaseType"
                        checked={form.purchaseType === option.id}
                        onChange={() => updateForm("purchaseType", option.id)}
                        className="accent-[#3182F6]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                심의 학년도
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(event) => updateForm("academicYear", event.target.value)}
                  placeholder="예: 2026"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                업체명
                <input
                  type="text"
                  value={form.vendorName}
                  onChange={(event) => updateForm("vendorName", event.target.value)}
                  placeholder="예: 메디칼기기(주)"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                업체 담당자 연락처
                <input
                  type="text"
                  value={form.vendorContact}
                  onChange={(event) => updateForm("vendorContact", event.target.value)}
                  placeholder="예: 010-1234-5678"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                모델명
                <input
                  type="text"
                  value={form.modelName}
                  onChange={(event) => updateForm("modelName", event.target.value)}
                  placeholder="예: ACUSON XG"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                장비단가 (원)
                <input
                  type="number"
                  value={form.listPrice}
                  onChange={(event) => updateForm("listPrice", event.target.value)}
                  placeholder="예: 50000000"
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-sm font-medium text-slate-400 hover:text-slate-600"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleRegister}
                disabled={!form.nameKo.trim() && !form.nameEn.trim()}
                className="rounded-xl bg-[#3182F6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2272eb] disabled:bg-slate-200 disabled:text-slate-400"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
