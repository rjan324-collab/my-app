"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CHECKLIST_STAGES,
  FUNNEL_STATUS_OPTIONS,
  getFunnelStatus,
  isValidEquipmentArray,
  PURCHASE_TYPE_OPTIONS,
  type Equipment,
  type PurchaseType,
} from "@/lib/equipment";
import { mergeEquipments } from "@/lib/storage";
import { useEquipments } from "@/lib/use-equipments";

// 정책=빨강, 구입=노랑, 공동운영=초록, 임대=파랑
const TYPE_COLORS: Record<PurchaseType, string> = {
  policy: "#EF4444",
  purchase: "#EAB308",
  joint: "#22C55E",
  lease: "#3182F6",
};

// 의료장비 심의 통과 > 학년도별 현황 (체크리스트 데이터와 연동해서 계산한다, 별도 저장 없음)
export default function ReviewYearPage() {
  const params = useParams<{ year: string }>();
  const year = params.year;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [equipments, setEquipments] = useEquipments();
  const [importMessage, setImportMessage] = useState("");

  const yearItems = equipments.filter((equipment) => equipment.academicYear === year);
  const reviewedYearItems = yearItems.filter((equipment) => equipment.reviewStatus === "reviewed");

  // 장비단가·계약단가·네고율은 구입 장비만 집계한다 (정책·공동운영·임대는 별도 예산이라 제외)
  const budgetItems = yearItems.filter((equipment) => equipment.purchaseType === "purchase");
  const otherItems = yearItems.filter((equipment) => equipment.purchaseType !== "purchase");
  const otherTotal = otherItems.reduce((sum, e) => sum + e.listPrice, 0);

  const contractedItems = budgetItems.filter((equipment) => equipment.contractPrice > 0);
  const listPriceOfContracted = contractedItems.reduce((sum, e) => sum + e.listPrice, 0);
  const contractPriceSum = contractedItems.reduce((sum, e) => sum + e.contractPrice, 0);
  const negoRate =
    listPriceOfContracted > 0
      ? ((listPriceOfContracted - contractPriceSum) / listPriceOfContracted) * 100
      : null;
  const totalListPrice = budgetItems.reduce((sum, e) => sum + e.listPrice, 0);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        setImportMessage("파일을 읽지 못했습니다. JSON 형식을 확인해 주세요.");
        return;
      }

      // 형식이 어긋난 항목이 하나라도 있으면 전체를 거부한다 — 일부만 들어가면
      // 화면이 계속 깨진 채로 저장돼 되돌리기 어렵다
      if (!isValidEquipmentArray(parsed)) {
        setImportMessage("장비 건 데이터 형식이 아닙니다. 파일 내용을 확인해 주세요.");
        return;
      }

      const overwriteCount = parsed.filter((item) =>
        equipments.some((existing) => existing.id === item.id),
      ).length;
      setEquipments(mergeEquipments(equipments, parsed));
      setImportMessage(
        `${parsed.length}건을 가져왔습니다${overwriteCount > 0 ? ` (기존 ${overwriteCount}건은 덮어씀)` : ""}.`,
      );
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-1 flex-col bg-[#F2F4F6] dark:bg-[#171B22]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
            {year}학년도 심의 현황
          </h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleImportClick}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#3182F6] shadow-sm dark:bg-[#1F242C]"
            >
              심의자료 가져오기 (JSON)
            </button>
          </div>
        </header>

        {importMessage && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{importMessage}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="장비단가 합계 (구입)" value={`${totalListPrice.toLocaleString()}원`} />
          <SummaryCard label="계약단가 합계" value={`${contractPriceSum.toLocaleString()}원`} />
          <SummaryCard
            label="네고율"
            value={negoRate === null ? "계약 전" : `${negoRate.toFixed(1)}%`}
          />
        </div>
        <p className="text-xs text-slate-400">
          정책·공동운영·임대 장비단가 (별도 집계): {otherTotal.toLocaleString()}원
        </p>

        {yearItems.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-slate-400 dark:bg-[#1F242C]">
            {year}학년도로 등록된 장비 건이 없습니다. 심의자료를 가져오거나 현황판에서 등록해 주세요.
          </p>
        ) : (
          PURCHASE_TYPE_OPTIONS.map((type) => (
            <PurchaseTypeSection
              key={type.id}
              typeId={type.id}
              typeLabel={type.label}
              items={reviewedYearItems.filter((equipment) => equipment.purchaseType === type.id)}
            />
          ))
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:bg-[#1F242C]">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-lg font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function PurchaseTypeSection({
  typeId,
  typeLabel,
  items,
}: {
  typeId: PurchaseType;
  typeLabel: string;
  items: Equipment[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const total = items.length;
  const color = TYPE_COLORS[typeId];
  const counts = FUNNEL_STATUS_OPTIONS.map((status) => ({
    ...status,
    count: items.filter((equipment) => getFunnelStatus(equipment) === status.id).length,
  }));
  const receivedCount = counts.find((status) => status.id === "received")?.count ?? 0;
  const progressPercent = total > 0 ? Math.round((receivedCount / total) * 100) : 0;

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border-l-4 bg-white px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:bg-[#1F242C]"
      style={{ borderLeftColor: color }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={total === 0}
        className="flex w-full items-baseline gap-2 text-left font-semibold text-slate-900 disabled:cursor-default dark:text-white"
      >
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        {typeLabel}장비 ({total}건)
        {total > 0 && (
          <span className="text-sm font-medium" style={{ color }}>
            진행률 {progressPercent}% (입고완료 {receivedCount}건)
          </span>
        )}
        {total > 0 && (
          <span className="ml-auto text-xs text-slate-400">{isOpen ? "접기 ▲" : "목록 보기 ▼"}</span>
        )}
      </button>
      {total === 0 ? (
        <p className="text-sm text-slate-400">통과된 {typeLabel}장비가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {counts.map((status) => {
            const percent = total > 0 ? Math.round((status.count / total) * 100) : 0;
            return (
              <div key={`${typeId}-${status.id}`} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  {status.label}
                </span>
                <div className="h-2.5 flex-1 rounded-full bg-[#F2F4F6] dark:bg-[#171B22]">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: color }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm text-slate-500 dark:text-slate-400">
                  {status.count}건 ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && (
        <ul className="flex flex-col gap-1.5 border-t border-[#F2F4F6] pt-3 dark:border-[#171B22]">
          {items.map((equipment) => {
            const stageCount = CHECKLIST_STAGES.filter(
              (stage) => equipment.stageChecked[stage.id],
            ).length;
            const statusLabel = FUNNEL_STATUS_OPTIONS.find(
              (status) => status.id === getFunnelStatus(equipment),
            )?.label;
            const name =
              [equipment.nameKo, equipment.nameEn].filter(Boolean).join(" · ") || "(이름 없음)";

            return (
              <li key={equipment.id}>
                <Link
                  href={`/equipment/${equipment.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-[#F2F4F6] dark:hover:bg-[#171B22]"
                >
                  <span className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-white">{name}</span>
                    <span className="text-xs text-slate-400">{equipment.department}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium" style={{ color }}>
                    {stageCount}/{CHECKLIST_STAGES.length} · {statusLabel}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
