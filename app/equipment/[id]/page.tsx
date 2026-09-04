"use client";

import dynamic from "next/dynamic";

// 체크리스트 화면은 localStorage(브라우저 전용 저장소)를 읽어야 해서 서버 렌더링 없이 클라이언트에서만 그린다
const EquipmentDetailClient = dynamic(() => import("./detail-client"), { ssr: false });

export default function EquipmentDetailPage() {
  return <EquipmentDetailClient />;
}
