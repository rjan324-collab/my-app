// 장비 입고 체크리스트의 데이터 모델
// PLAN.md 1번 작업: 장비 건 하나가 가지는 정보와 초기값 규칙을 정의한다

// 6단계 체크리스트 (PRD 4·5번, DESIGN 화면 구성 순서와 동일)
export type ChecklistStageId =
  | "cooperationRequest" // 협조전 전송
  | "receipt" // 접수
  | "approvalDraft" // 결재문 기안
  | "contractDate" // 계약일자 확정
  | "contractDelivery" // 계약서·납품일 확인
  | "inspection"; // 입고·검수

export const CHECKLIST_STAGES: { id: ChecklistStageId; label: string }[] = [
  { id: "cooperationRequest", label: "협조전 전송" },
  { id: "receipt", label: "접수" },
  { id: "approvalDraft", label: "결재문 기안" },
  { id: "contractDate", label: "계약일자 확정" },
  { id: "contractDelivery", label: "계약서·납품일 확인" },
  { id: "inspection", label: "입고·검수" },
];

// 결재문 기안 단계에서 확인해야 하는 첨부 서류 5개 (PRD 5번 must 1 규칙)
export type ApprovalDocumentId =
  | "priceComparison" // 가격대비표
  | "quotation" // 견적서
  | "application" // 신청서
  | "otherHospitalRecord" // 타병원실적
  | "contract"; // 계약서

export const APPROVAL_DOCUMENTS: { id: ApprovalDocumentId; label: string }[] = [
  { id: "priceComparison", label: "가격대비표" },
  { id: "quotation", label: "견적서" },
  { id: "application", label: "신청서" },
  { id: "otherHospitalRecord", label: "타병원실적" },
  { id: "contract", label: "계약서" },
];

// 심의(의료장비 도입 심의위원회 등) 통과 여부
export type ReviewStatus = "reviewed" | "exempt";

export const REVIEW_STATUS_OPTIONS: { id: ReviewStatus; label: string }[] = [
  { id: "reviewed", label: "심의통과" },
  { id: "exempt", label: "심의외" },
];

// 정책 구입 / 구입 / 공동운영 / 임대 구분
export type PurchaseType = "policy" | "purchase" | "joint" | "lease";

export const PURCHASE_TYPE_OPTIONS: { id: PurchaseType; label: string }[] = [
  { id: "policy", label: "정책" },
  { id: "purchase", label: "구입" },
  { id: "joint", label: "공동운영" },
  { id: "lease", label: "임대" },
];

// 장비 건 하나의 데이터 구조
export interface Equipment {
  id: string;
  nameKo: string; // 장비명 (한글)
  nameEn: string; // 장비명 (영어)
  department: string; // 담당 진료과
  reviewStatus: ReviewStatus; // 심의통과 / 심의외 구분
  purchaseType: PurchaseType; // 구입 / 임대 구분
  academicYear: string; // 심의 학년도 (예: "2026")
  vendorName: string; // 업체명
  vendorContact: string; // 업체 담당자 연락처
  modelName: string; // 모델명 (영어)
  listPrice: number; // 장비단가 (신청 시 견적 금액)
  contractPrice: number; // 계약단가 (계약 단계에서 입력, 미입력 시 0)
  cooperationRequestDate: string; // 협조전 전송일자 (미입력 시 빈 문자열)
  receiptDate: string; // 접수일자 (미입력 시 빈 문자열)
  contractConfirmedDate: string; // 계약일자 확정 단계에서 확정된 계약일자 (미입력 시 빈 문자열)
  deliveryDate: string; // 납품 예정일자 (계약서·납품일 확인 단계에서 입력, 미입력 시 빈 문자열)
  receivedAt: string; // 입고일자 (입고·검수 단계 체크 시 자동 기록되며 직접 수정도 가능, 미완료면 빈 문자열)
  stageChecked: Record<ChecklistStageId, boolean>; // 6단계 각각의 체크 여부
  approvalDocumentsChecked: Record<ApprovalDocumentId, boolean>; // 결재문 기안 서류 5개 체크 여부
  createdAt: string; // 등록 시각 (ISO 문자열)
}

// 심의자료 JSON 가져오기 등 외부 파일에서 온 값이 Equipment 형태를 갖췄는지 검사한다.
// 형식이 어긋난 항목이 하나라도 있으면 전체를 거부해서, 깨진 데이터가 저장된 채 화면이 계속 죽는 것을 막는다
function isValidEquipment(value: unknown): value is Equipment {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (typeof v.id !== "string" || !v.id) return false;
  if (typeof v.nameKo !== "string" || typeof v.nameEn !== "string") return false;

  const stageChecked = v.stageChecked;
  if (typeof stageChecked !== "object" || stageChecked === null) return false;
  if (
    !CHECKLIST_STAGES.every(
      (stage) => typeof (stageChecked as Record<string, unknown>)[stage.id] === "boolean",
    )
  ) {
    return false;
  }

  const approvalDocumentsChecked = v.approvalDocumentsChecked;
  if (typeof approvalDocumentsChecked !== "object" || approvalDocumentsChecked === null) {
    return false;
  }
  return APPROVAL_DOCUMENTS.every(
    (doc) => typeof (approvalDocumentsChecked as Record<string, unknown>)[doc.id] === "boolean",
  );
}

export function isValidEquipmentArray(value: unknown): value is Equipment[] {
  return Array.isArray(value) && value.every(isValidEquipment);
}

// 완료 여부는 저장하지 않고, 6단계가 모두 체크됐는지로 계산한다
export function isEquipmentCompleted(equipment: Pick<Equipment, "stageChecked">): boolean {
  return CHECKLIST_STAGES.every((stage) => equipment.stageChecked[stage.id]);
}

// 심의 통과 이후 진행 상태 (체크리스트 단계와 연동해서 계산하는 값, 별도로 저장하지 않는다)
export type FunnelStatus =
  | "passed"
  | "requested"
  | "drafted"
  | "contracted"
  | "receiving"
  | "received";

export const FUNNEL_STATUS_OPTIONS: { id: FunnelStatus; label: string }[] = [
  { id: "passed", label: "통과" },
  { id: "requested", label: "협조전 접수" },
  { id: "drafted", label: "기안완료" },
  { id: "contracted", label: "계약완료" },
  { id: "receiving", label: "입고중" },
  { id: "received", label: "입고완료" },
];

export function getFunnelStatus(
  equipment: Pick<Equipment, "stageChecked">,
): FunnelStatus {
  if (equipment.stageChecked.inspection) return "received";
  if (equipment.stageChecked.contractDelivery) return "receiving";
  if (equipment.stageChecked.contractDate) return "contracted";
  if (equipment.stageChecked.approvalDraft) return "drafted";
  if (equipment.stageChecked.cooperationRequest) return "requested";
  return "passed";
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// 새 장비 건을 등록할 때 쓰는 초기값 (모든 단계·서류 미체크, 미완료 상태)
export function createEquipment(input: {
  nameKo: string;
  nameEn: string;
  department: string;
  reviewStatus: ReviewStatus;
  purchaseType: PurchaseType;
  academicYear: string;
  vendorName: string;
  vendorContact: string;
  modelName: string;
  listPrice: number;
}): Equipment {
  const stageChecked = CHECKLIST_STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = false;
      return acc;
    },
    {} as Record<ChecklistStageId, boolean>,
  );

  const approvalDocumentsChecked = APPROVAL_DOCUMENTS.reduce(
    (acc, doc) => {
      acc[doc.id] = false;
      return acc;
    },
    {} as Record<ApprovalDocumentId, boolean>,
  );

  return {
    id: crypto.randomUUID(),
    nameKo: input.nameKo,
    nameEn: input.nameEn,
    department: input.department,
    reviewStatus: input.reviewStatus,
    purchaseType: input.purchaseType,
    academicYear: input.academicYear,
    vendorName: input.vendorName,
    vendorContact: input.vendorContact,
    modelName: input.modelName,
    listPrice: input.listPrice,
    contractPrice: 0,
    cooperationRequestDate: "",
    receiptDate: "",
    contractConfirmedDate: "",
    deliveryDate: "",
    receivedAt: "",
    stageChecked,
    approvalDocumentsChecked,
    createdAt: new Date().toISOString(),
  };
}

function arePreviousStagesChecked(
  equipment: Pick<Equipment, "stageChecked">,
  stageId: ChecklistStageId,
): boolean {
  const index = CHECKLIST_STAGES.findIndex((stage) => stage.id === stageId);
  return CHECKLIST_STAGES.slice(0, index).every((stage) => equipment.stageChecked[stage.id]);
}

// 이 단계를 지금 체크할 수 있는지 계산한다 (이전 단계 완료 + 결재문 기안은 서류 5개까지 완료돼야 함)
export function canCheckStage(
  equipment: Pick<Equipment, "stageChecked" | "approvalDocumentsChecked">,
  stageId: ChecklistStageId,
): boolean {
  if (!arePreviousStagesChecked(equipment, stageId)) return false;

  if (stageId === "approvalDraft") {
    return APPROVAL_DOCUMENTS.every((doc) => equipment.approvalDocumentsChecked[doc.id]);
  }
  return true;
}

// 결재문 기안 체크박스는 서류를 미리 다 체크하지 않아도, 이전 단계(접수)만 끝났으면 누를 수 있다
// (누르는 순간 서류 5개도 함께 체크된다)
export function canStartApprovalDraft(equipment: Pick<Equipment, "stageChecked">): boolean {
  return arePreviousStagesChecked(equipment, "approvalDraft");
}

// 특정 단계부터 그 뒤 단계까지 전부 해제한다 (체크 해제 시 연쇄 해제에 쓰인다)
function uncheckFromStage(
  stageChecked: Record<ChecklistStageId, boolean>,
  fromStageId: ChecklistStageId,
): Record<ChecklistStageId, boolean> {
  const fromIndex = CHECKLIST_STAGES.findIndex((stage) => stage.id === fromStageId);
  const next = { ...stageChecked };
  CHECKLIST_STAGES.slice(fromIndex).forEach((stage) => {
    next[stage.id] = false;
  });
  return next;
}

// 입고·검수를 체크하는 순간 입고일자가 비어 있으면 오늘 날짜로 채운다.
// 입고일자는 상세 화면에서 직접 입력·수정도 가능해서, 체크 해제 시에는 지우지 않고 그대로 둔다
// (실제 입고일은 검수 체크 여부와 별개로 남는 사실이기 때문)
function withReceivedAt(
  equipment: Equipment,
  stageChecked: Record<ChecklistStageId, boolean>,
): Equipment {
  const receivedAt =
    stageChecked.inspection && !equipment.receivedAt ? todayString() : equipment.receivedAt;
  return { ...equipment, stageChecked, receivedAt };
}

// 단계 체크박스를 토글한다. 체크는 canCheckStage를 통과해야 하고, 해제하면 이후 단계도 함께 해제된다
// 결재문 기안은 서류 5개 체크 결과로만 완료되므로(toggleApprovalDocument 참고), 화면에서 이 단계를 직접 토글하지 않는다
export function toggleStage(equipment: Equipment, stageId: ChecklistStageId): Equipment {
  const isChecked = equipment.stageChecked[stageId];

  if (isChecked) {
    return withReceivedAt(equipment, uncheckFromStage(equipment.stageChecked, stageId));
  }

  if (!canCheckStage(equipment, stageId)) {
    return equipment;
  }

  return withReceivedAt(equipment, { ...equipment.stageChecked, [stageId]: true });
}

// 서류 체크박스를 토글한다. 이전 단계(접수)가 끝나기 전에는 서류를 체크할 수 없다.
// 서류 5개가 모두 체크되면 결재문 기안 단계가 자동으로 완료 처리되고,
// 하나라도 해제했는데 결재문 기안이 이미 체크돼 있었다면 그 단계부터 함께 해제한다
export function toggleApprovalDocument(
  equipment: Equipment,
  documentId: ApprovalDocumentId,
): Equipment {
  if (!canStartApprovalDraft(equipment)) return equipment;

  const wasChecked = equipment.approvalDocumentsChecked[documentId];
  const approvalDocumentsChecked = {
    ...equipment.approvalDocumentsChecked,
    [documentId]: !wasChecked,
  };

  if (wasChecked) {
    const stageChecked = equipment.stageChecked.approvalDraft
      ? uncheckFromStage(equipment.stageChecked, "approvalDraft")
      : equipment.stageChecked;
    return withReceivedAt({ ...equipment, approvalDocumentsChecked }, stageChecked);
  }

  const allDocumentsChecked = APPROVAL_DOCUMENTS.every((doc) => approvalDocumentsChecked[doc.id]);
  const stageChecked = allDocumentsChecked
    ? { ...equipment.stageChecked, approvalDraft: true }
    : equipment.stageChecked;
  return withReceivedAt({ ...equipment, approvalDocumentsChecked }, stageChecked);
}
