import Image from "next/image";

interface AddBasketProps {
  onClick?: () => void;
}

export default function AddBasket({ onClick }: AddBasketProps) {
  return (
    <div className="w-full h-[67px] mb-[18px]">
      <div
        className="w-full h-full bg-[#FFDB0D] border border-[#245B7B] rounded-[18px] flex items-center justify-center px-4 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {/* Plus Icon */}
          <div className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/icons/plus-circle-icon.svg"
              alt="Add"
              width={36}
              height={36}
              className="text-[#181D27]"
            />
          </div>

          {/* Add Basket Text */}
          <span className="text-[16px] font-bold leading-[24px] text-[#111827]">
            Add Basket
          </span>
        </div>
      </div>
    </div>
  );
}
