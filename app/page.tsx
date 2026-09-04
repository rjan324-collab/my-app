"use client";

import dynamic from "next/dynamic";

// 현황판은 localStorage(브라우저 전용 저장소)를 읽어야 해서 서버 렌더링 없이 클라이언트에서만 그린다
const HomeClient = dynamic(() => import("./home-client"), { ssr: false });

export default function Home() {
  return <HomeClient />;
}
