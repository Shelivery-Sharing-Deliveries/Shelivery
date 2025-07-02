import Image from "next/image";

interface Basket {
  id: string;
  shopName: string;
  shopLogo: string;
  total: string;
  status: "ordering" | "on_the_way" | "waiting" | "delivered" | "draft";
}

interface BasketsProps {
  baskets: Basket[];
  onBasketClick?: (basketId: string) => void;
}

const statusConfig = {
  ordering: {
    text: "Ordering",
    bgColor: "#FEF3F2",
    textColor: "#B42318",
    borderColor: "#FFECEE",
  },
  on_the_way: {
    text: "On the way",
    bgColor: "#EFF8FF",
    textColor: "#175CD3",
    borderColor: "#D8F0FE",
  },
  waiting: {
    text: "waiting",
    bgColor: "#EFF8FF",
    textColor: "#175CD3",
    borderColor: "#D8F0FE",
  },
  delivered: {
    text: "Delivered",
    bgColor: "#ECFDF3",
    textColor: "#027A48",
    borderColor: "#D1FADF",
  },
  draft: {
    text: "Draft",
    bgColor: "#F5F5F5",
    textColor: "#414651",
    borderColor: "#EFF1F3",
  },
};

export default function Baskets({ baskets, onBasketClick }: BasketsProps) {
  const isEmpty = baskets.length === 0;

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center mb-4">
        <h2 className="text-[16px] font-bold leading-8 text-black">
          Your Baskets
        </h2>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center gap-3 w-full px-4 py-8">
          <div className="flex justify-center">
            <Image
              src="/icons/empty-basket-illustration.png"
              alt="Empty basket"
              width={160}
              height={190}
            />
          </div>
          <p className="text-[14px] font-medium leading-[20px] text-center text-black max-w-[280px]">
            Create your first group basket to unlock free delivery
          </p>
        </div>
      ) : (
        /* Baskets List */
        <div className="flex flex-col gap-3">
          {baskets.map((basket) => (
            <BasketCard
              key={basket.id}
              basket={basket}
              onClick={() => onBasketClick?.(basket.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BasketCardProps {
  basket: Basket;
  onClick?: () => void;
}

function BasketCard({ basket, onClick }: BasketCardProps) {
  const statusStyle = statusConfig[basket.status];

  // Add error handling in case statusStyle is undefined
  if (!statusStyle) {
    console.error("Unknown basket status:", basket.status);
    return null;
  }
  
  return (
    <div
      className="w-full bg-white border border-[#D1D5DB] rounded-[16px] p-2 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Shop info */}
        <div className="flex items-center gap-3">
          {/* Shop Logo */}
          <div
            className="w-[54px] h-[54px] rounded-[12px] bg-cover bg-center"
            style={{ backgroundImage: `url(${basket.shopLogo.replace(/ /g, "%20")})` }}
          />

          {/* Shop details */}
          <div className="flex flex-col gap-1">
            <span className="text-[16px] font-bold leading-[24px] text-[#111827]">
              {basket.shopName}
            </span>
            <span className="text-[12px] font-normal leading-[16px] text-[#374151]">
              Total: ${basket.total}
            </span>
          </div>
        </div>

        {/* Right side - Status badge */}
        <div className="flex items-center">
          <div
            className="px-2 py-0.5 rounded-[16px] border"
            style={{
              backgroundColor: statusStyle.bgColor,
              borderColor: statusStyle.borderColor,
            }}
          >
            <span
              className="text-[12px] font-medium leading-[16px]"
              style={{ color: statusStyle.textColor }}
            >
              {statusStyle.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
