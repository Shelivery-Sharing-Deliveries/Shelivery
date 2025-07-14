"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, OrderForm } from "@/components/create-basket";

interface OrderFormData {
  orderLink: string;
  total: string;
  currency: string;
}

export default function CreateBasketPage() {
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState<OrderFormData | null>(null);
  const router = useRouter();

  const handleFormChange = (data: OrderFormData) => {
    setFormData(data);
    // Validate form - both fields should be filled
    const isValid = data.orderLink.trim() !== "" && data.total.trim() !== "";
    setIsFormValid(isValid);
  };

  const handleSubmit = (data: OrderFormData) => {
    console.log("Creating basket with:", data);
    // Here you would typically make an API call to create the basket
    // For now, let's redirect to dashboard
    router.push("/dashboard");
  };

  const handleCreateBasket = () => {
    if (formData && isFormValid) {
      handleSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] w-full max-w-[375px] mx-auto flex flex-col">
      {/* Header */}
      <Header />

      {/* Content Section */}
      <div className="flex-1 px-4 py-6 flex flex-col justify-between min-h-0">
        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          <OrderForm onSubmit={handleSubmit} onChange={handleFormChange} />
        </div>

        {/* Bottom Button */}
        <div className="pt-6">
          <button
            onClick={handleCreateBasket}
            disabled={!isFormValid}
            className={`w-full bg-[#FFDB0D] rounded-[16px] px-4 py-3 flex items-center justify-center gap-2 transition-all duration-200 min-h-[48px] ${
              isFormValid
                ? "hover:bg-[#FFDB0D]/90 cursor-pointer"
                : "opacity-50 cursor-not-allowed bg-[#E5E8EB]"
            }`}
          >
            <span className="text-[#000000] text-[18px] font-semibold leading-[26px]">
              Create Basket
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
