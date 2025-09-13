"use client";

import { Suspense } from "react";
import CreateBasketContent from "./CreateBasketContent";

export default function CreateBasketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFB] w-full max-w-[375px] mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full" />
      </div>
    }>
      <CreateBasketContent />
    </Suspense>
  );
}
