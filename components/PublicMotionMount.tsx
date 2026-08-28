"use client";

import dynamic from "next/dynamic";

const PublicMotion = dynamic(() => import("./PublicMotion"), { ssr: false });

export default function PublicMotionMount() {
  return <PublicMotion />;
}
