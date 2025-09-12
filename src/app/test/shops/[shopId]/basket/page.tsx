"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, OrderForm } from "@/components/create-basket";

interface OrderFormData {
  orderLink: string;
  total: string;
  currency: string;
}

interface CreateBasketPageProps {
  params: { shopId: string };
}

export default function TestCreateBasketPage({ params }: CreateBasketPageProps) {
  const { shopId } = params;
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState<OrderFormData | null>(null);
  const router = useRouter();

  const handleFormChange = (data: OrderFormData) => {
    setFormData(data);
    const isValid = data.orderLink.trim() !== "" && data.total.trim() !== "";
    setIsFormValid(isValid);
  };

  const handleSubmit = (data: OrderFormData) => {
    console.log("Test: Creating basket for shopId:", shopId, "with data:", data);

    // Retrieve existing baskets from localStorage
    const existingBasketsString = localStorage.getItem("testBaskets");
    const existingBaskets = existingBasketsString ? JSON.parse(existingBasketsString) : [];

    // Create a new basket object
    const newBasket = {
      id: `test-basket-${Date.now()}`,
      shopId: shopId,
      ...data,
      createdAt: new Date().toISOString(),
    };

    // Add the new basket to the array
    const updatedBaskets = [...existingBaskets, newBasket];

    // Save the updated array back to localStorage
    localStorage.setItem("testBaskets", JSON.stringify(updatedBaskets));

    console.log("Test: Basket saved locally:", newBasket);
    alert("Test: Basket saved locally! Check console and localStorage.");

    // Redirect to a test dashboard or back to test shops page
    router.push("/test/dashboard"); // Assuming a test dashboard exists or will be created
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
              Create Basket (Test)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
