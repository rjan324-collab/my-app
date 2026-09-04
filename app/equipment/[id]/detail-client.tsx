"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  APPROVAL_DOCUMENTS,
  canCheckStage,
  canStartApprovalDraft,
  CHECKLIST_STAGES,
  isEquipmentCompleted,
  REVIEW_STATUS_OPTIONS,
  toggleApprovalDocument,
  toggleStage,
  type Equipment,
} from "@/lib/equipment";
import { useEquipments } from "@/lib/use-equipments";

// 체크리스트 화면 (PLAN.md 4·5·6번 작업)
// 이전 단계 미완료 시 다음 단계 진행 불가, 해제 시 이후 단계 연쇄 해제
// 결재문 기안 체크박스를 누르면 서류 5개도 한 번에 체크된다
export default function EquipmentDetailPage() {
  // 이 페이지는 next/dynamic(ssr:false)로만 렌더링되므로 브라우저에서만 실행된다
  const params = useParams<{ id: string }>();
  const [equipments, setEquipments] = useEquipments();

  const equipment = equipments.find((item) => item.id === params.id);

  function updateEquipment(updated: Equipment) {
    setEquipments(equipments.map((item) => (item.id === updated.id ? updated : item)));
  }

  if (!equipment) {
    return (
      <div className="flex flex-1 flex-col bg-[#F2F4F6] dark:bg-[#171B22]">
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-10">
          <p className="text-slate-500 dark:text-slate-400">해당 장비 건을 찾을 수 없습니다.</p>
          <Link href="/" className="text-sm font-medium text-[#3182F6]">
            ← 현황판으로
          </Link>
        </main>
      </div>
    );
  }

  const currentStageId =
    CHECKLIST_STAGES.find((stage) => !equipment.stageChecked[stage.id])?.id ?? null;
  const isReviewed = equipment.reviewStatus === "reviewed";

  return (
    <div className="flex flex-1 flex-col bg-[#F2F4F6] dark:bg-[#171B22]">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
        <Link href="/" className="text-sm font-medium text-[#3182F6]">
          ← 현황판으로
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="flex flex-wrap items-baseline gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            {[equipment.nameKo, equipment.nameEn].filter(Boolean).join(" · ") || "(이름 없음)"}
            {equipment.department && (
              <span className="text-base font-normal text-slate-400">
                {equipment.department}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isReviewed ? "bg-[#E8F3FF] text-[#3182F6]" : "bg-[#FFF4E5] text-[#F59E0B]"
              }`}
            >
              {REVIEW_STATUS_OPTIONS.find((option) => option.id === equipment.reviewStatus)?.label}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {[
              equipment.vendorName,
              equipment.modelName,
              equipment.listPrice ? `장비단가 ${equipment.listPrice.toLocaleString()}원` : "",
              equipment.contractPrice ? `계약단가 ${equipment.contractPrice.toLocaleString()}원` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {CHECKLIST_STAGES.map((stage) => {
            const checked = equipment.stageChecked[stage.id];
            const isCurrent = stage.id === currentStageId;
            const isApprovalDraft = stage.id === "approvalDraft";
            // 결재문 기안은 서류 5개 체크로만 완료되는 표시 항목이라 직접 토글할 수 없다
            const disabled = isApprovalDraft ? true : !checked && !canCheckStage(equipment, stage.id);
            const documentsDisabled = !canStartApprovalDraft(equipment);

            return (
              <li
                key={stage.id}
                className={`rounded-2xl bg-white px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:bg-[#1F242C] ${
                  isCurrent ? "ring-2 ring-[#3182F6]" : ""
                }`}
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => updateEquipment(toggleStage(equipment, stage.id))}
                    className="h-4 w-4 accent-[#3182F6]"
                  />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {stage.label}
                  </span>
                  {isApprovalDraft && (
                    <span className="text-xs text-slate-400">
                      (아래 서류 5개를 모두 체크하면 자동으로 완료됩니다)
                    </span>
                  )}
                </label>

                {stage.id === "cooperationRequest" && (
                  <div className="mt-3 flex items-center gap-2 pl-7 text-sm text-slate-500 dark:text-slate-400">
                    협조전 전송일자:
                    <input
                      type="date"
                      value={equipment.cooperationRequestDate || ""}
                      onChange={(event) =>
                        updateEquipment({ ...equipment, cooperationRequestDate: event.target.value })
                      }
                      className="rounded-lg border-none bg-[#F2F4F6] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22]"
                    />
                  </div>
                )}

                {stage.id === "receipt" && (
                  <div className="mt-3 flex items-center gap-2 pl-7 text-sm text-slate-500 dark:text-slate-400">
                    접수일자:
                    <input
                      type="date"
                      value={equipment.receiptDate || ""}
                      onChange={(event) =>
                        updateEquipment({ ...equipment, receiptDate: event.target.value })
                      }
                      className="rounded-lg border-none bg-[#F2F4F6] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22]"
                    />
                  </div>
                )}

                {stage.id === "contractDate" && (
                  <div className="mt-3 flex items-center gap-2 pl-7 text-sm text-slate-500 dark:text-slate-400">
                    계약일자:
                    <input
                      type="date"
                      value={equipment.contractConfirmedDate || ""}
                      onChange={(event) =>
                        updateEquipment({ ...equipment, contractConfirmedDate: event.target.value })
                      }
                      className="rounded-lg border-none bg-[#F2F4F6] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22]"
                    />
                  </div>
                )}

                {stage.id === "approvalDraft" && (
                  <ul className="mt-3 flex flex-col gap-2 pl-7 text-sm text-slate-500 dark:text-slate-400">
                    {APPROVAL_DOCUMENTS.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={equipment.approvalDocumentsChecked[doc.id]}
                          disabled={documentsDisabled}
                          onChange={() =>
                            updateEquipment(toggleApprovalDocument(equipment, doc.id))
                          }
                          className="h-4 w-4 accent-[#3182F6]"
                        />
                        {doc.label}
                      </li>
                    ))}
                  </ul>
                )}

                {stage.id === "contractDelivery" && (
                  <div className="mt-3 flex flex-col gap-2 pl-7 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      납품 예정일자:
                      <input
                        type="date"
                        value={equipment.deliveryDate || ""}
                        onChange={(event) =>
                          updateEquipment({ ...equipment, deliveryDate: event.target.value })
                        }
                        className="rounded-lg border-none bg-[#F2F4F6] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      계약단가:
                      <input
                        type="number"
                        value={equipment.contractPrice || ""}
                        onChange={(event) =>
                          updateEquipment({
                            ...equipment,
                            contractPrice: Number(event.target.value) || 0,
                          })
                        }
                        placeholder="원"
                        className="w-40 rounded-lg border-none bg-[#F2F4F6] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22]"
                      />
                      원
                    </div>
                  </div>
                )}

                {stage.id === "inspection" && (
                  <div className="mt-3 flex items-center gap-2 pl-7 text-sm text-slate-500 dark:text-slate-400">
                    입고일자:
                    <input
                      type="date"
                      value={equipment.receivedAt || ""}
                      onChange={(event) =>
                        updateEquipment({ ...equipment, receivedAt: event.target.value })
                      }
                      className="rounded-lg border-none bg-[#F2F4F6] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22]"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {isEquipmentCompleted(equipment) && (
          <p className="rounded-2xl bg-[#E9FBF0] px-5 py-4 text-sm font-medium text-[#1DB67D]">
            모든 단계가 완료됐습니다. {equipment.receivedAt && `(입고일자: ${equipment.receivedAt})`}
          </p>
        )}
      </main>
    </div>
  );
}
