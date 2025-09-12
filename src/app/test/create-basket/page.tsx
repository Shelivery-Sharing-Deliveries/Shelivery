"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header, OrderForm } from "@/components/create-basket";

interface OrderFormData {
  orderLink: string;
  total: string;
  currency: string;
}

// Mock shops data (same as in choose-shop page)
const mockShops = [
  {
    id: "1",
    name: "Denner",
    logo: "/shop-logos/Denner Logo.png",
  },
  {
    id: "2",
    name: "Coop",
    logo: "/shop-logos/Coop Logo.png",
  },
  {
    id: "3",
    name: "Aldi",
    logo: "/shop-logos/Aldi Logo.png",
  },
  {
    id: "4",
    name: "Migros",
    logo: "/shop-logos/Migros Logo.png",
  },
  {
    id: "5",
    name: "Lidl",
    logo: "/shop-logos/Lidl Logo.png",
  },
];

export default function TestCreateBasketPage() {
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState<OrderFormData | null>(null);
  const [shop, setShop] = useState(null); // State to hold selected shop
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId"); // Get shopId from URL

  useEffect(() => {
    if (shopId) {
      const selectedShop = mockShops.find((s) => s.id === shopId);
      setShop(selectedShop);
    }
  }, [shopId]);

  const handleFormChange = (data: OrderFormData) => {
    setFormData(data);
    // Validate form - both fields should be filled
    const isValid = data.orderLink.trim() !== "" && data.total.trim() !== "";
    setIsFormValid(isValid);
  };

  const handleSubmit = (data: OrderFormData) => {
    console.log("Creating basket with:", data);
    // For the test, redirect to test dashboard
    router.push("/test/dashboard");
  };

  const handleCreateBasket = () => {
    if (formData && isFormValid) {
      handleSubmit(formData);
    }
  };

  return (
    // Removed outer div with bg-[#FAFAFB] etc.
    <div className="flex flex-col min-h-screen"> {/* This div is needed for flex-1 on content */}
      {/* Header - now passes shop prop */}
      <Header shop={shop} />

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