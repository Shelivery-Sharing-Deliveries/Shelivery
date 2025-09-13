"use client";

import { Suspense } from "react";
import SubmitBasketContent from "./SubmitBasketContent";

export default function SubmitBasketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full" />
      </div>
    }>
      <SubmitBasketContent />
    </Suspense>
  );
}
