"use client";

import { useState, useEffect, forwardRef } from "react";

interface OrderFormData {
  orderLink: string;
  total: string;
  currency: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  onChange?: (data: OrderFormData) => void;
  className?: string;
}

const OrderForm = forwardRef<HTMLFormElement, OrderFormProps>(
  ({ onSubmit, onChange, className = "" }, ref) => {
    const [orderLink, setOrderLink] = useState("");
    const [total, setTotal] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

    const currencies = ["USD", "CHF", "EUR"];

    // Call onChange when any field changes
    useEffect(() => {
      if (onChange) {
        onChange({ orderLink, total, currency });
      }
    }, [orderLink, total, currency, onChange]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({ orderLink, total, currency });
    };

    const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow only numbers and one decimal point
      if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
        setTotal(value);
      }
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} className={`w-full ${className}`}>
        <div className="flex flex-col gap-4">
          {/* Order Link/List Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
              Orders Link or Item Name
            </label>
            <div className="bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3 h-[120px]">
              <textarea
                value={orderLink}
                onChange={(e) => setOrderLink(e.target.value)}
                placeholder="Paste link or type items"
                className="w-full h-full text-[14px] font-normal leading-[20px] text-black placeholder:text-[#AEB4BC] outline-none bg-transparent resize-none"
              />
            </div>
          </div>

          {/* Total Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
              Total
            </label>
            <div className="relative">
              <div className="w-full bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3 flex items-center justify-between gap-2">
                {/* Input Field */}
                <input
                  type="text"
                  inputMode="decimal"
                  value={total}
                  onChange={handleTotalChange}
                  placeholder="e.g. 13.90"
                  className="flex-1 text-[14px] font-normal leading-[20px] text-black placeholder:text-[#AEB4BC] outline-none bg-transparent"
                />

                {/* Currency Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className="flex items-center gap-1 text-[14px] font-normal text-[#181D27] hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  >
                    <span>{currency}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform duration-200 ${
                        showCurrencyDropdown ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="#717680"
                        strokeWidth="1.67"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showCurrencyDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-[#E5E8EB] rounded-lg shadow-lg z-10 min-w-[60px]">
                      {currencies.map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => {
                            setCurrency(curr);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-[14px] font-normal hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            currency === curr
                              ? "text-[#245B7B] bg-[#EAF7FF]"
                              : "text-[#181D27]"
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Click overlay to close dropdown */}
              {showCurrencyDropdown && (
                <div
                  className="fixed inset-0 z-5"
                  onClick={() => setShowCurrencyDropdown(false)}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }
);

OrderForm.displayName = "OrderForm";

export default OrderForm;
