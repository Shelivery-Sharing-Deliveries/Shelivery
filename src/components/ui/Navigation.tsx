"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavigationProps {
  className?: string;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "category",
  },
  {
    name: "Stores",
    href: "/shops",
    icon: "shop",
  },
  {
    name: "Chatrooms",
    href: "/chatrooms",
    icon: "messages",
  },
];

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();

  const renderIcon = (iconType: string, isActive: boolean) => {
    let iconPath;

    if (iconType === "category") {
      // Category icon: already yellow, so use white filter when inactive
      iconPath = `/icons/navbar/category-bold-icon.svg`;
      const filter = isActive
        ? "none"
        : "brightness(0) saturate(100%) invert(100%)";

      return (
        <Image
          src={iconPath}
          alt={iconType}
          width={24}
          height={24}
          className="transition-all duration-200"
          style={{ filter }}
        />
      );
    } else {
      // For shop and messages icons, create SVG directly with the right color
      if (iconType === "shop") {
        const color = isActive ? "#FFDB0D" : "white";
        return (
          <svg
            width="21"
            height="22"
            viewBox="0 0 21 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-200"
          >
            <path
              d="M1.45156 10.0628V14.5946C1.45156 19.1264 3.26831 20.9431 7.8001 20.9431H13.2403C17.7721 20.9431 19.5888 19.1264 19.5888 14.5946V10.0628"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5252 10.8501C12.3722 10.8501 13.7348 9.34619 13.5531 7.49916L12.887 0.756981H8.17353L7.49729 7.49916C7.31562 9.34619 8.67818 10.8501 10.5252 10.8501Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.8939 10.8501C18.9327 10.8501 20.4265 9.1948 20.2247 7.16609L19.9421 4.39049C19.5787 1.76629 18.5694 0.756981 15.925 0.756981H12.8466L13.5531 7.83223C13.7247 9.49759 15.2286 10.8501 16.8939 10.8501Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.10603 10.8501C5.77139 10.8501 7.27526 9.49759 7.43675 7.83223L7.6588 5.60166L8.14326 0.756981H5.06488C2.42049 0.756981 1.41118 1.76629 1.04783 4.39049L0.775316 7.16609C0.573455 9.1948 2.06723 10.8501 4.10603 10.8501Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5252 15.8966C8.83968 15.8966 8.00196 16.7343 8.00196 18.4199V20.9431H13.0485V18.4199C13.0485 16.7343 12.2108 15.8966 10.5252 15.8966Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      } else if (iconType === "messages") {
        const color = isActive ? "#FFDB0D" : "white";
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-200"
          >
            <path
              d="M17.0933 9.74715V13.834C17.0933 14.0996 17.083 14.3551 17.0524 14.6003C16.8174 17.3589 15.1929 18.728 12.1993 18.728H11.7906C11.5351 18.728 11.2899 18.8506 11.1367 19.0549L9.91063 20.6897C9.36912 21.4151 8.49043 21.4151 7.94892 20.6897L6.72286 19.0549C6.59003 18.8812 6.29375 18.728 6.06898 18.728H5.6603C2.40103 18.728 0.766285 17.9209 0.766285 13.834V9.74715C0.766285 6.75353 2.14561 5.12901 4.89401 4.89401C5.13922 4.86336 5.39465 4.85314 5.6603 4.85314H12.1993C15.4585 4.85314 17.0933 6.48788 17.0933 9.74715Z"
              stroke={color}
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.1801 5.6603V9.74715C21.1801 12.751 19.8008 14.3653 17.0524 14.6003C17.0831 14.3551 17.0933 14.0996 17.0933 13.834V9.74715C17.0933 6.48788 15.4585 4.85314 12.1993 4.85314H5.66033C5.39468 4.85314 5.13926 4.86336 4.89404 4.89401C5.12904 2.14561 6.75356 0.766285 9.74718 0.766285H16.2861C19.5454 0.766285 21.1801 2.40103 21.1801 5.6603Z"
              stroke={color}
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.5114 12.2606H12.5206"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.93539 12.2606H8.94458"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.35939 12.2606H5.36859"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
    }

    return null;
  };

  return (
    <div className="w-full flex justify-center bg-[#245B7B]">
      <div
        className={`w-[343px] h-[74px] flex justify-center items-center gap-[45px] px-4 py-1.5 pb-6 ${className}`}
      >
        {navItems.map((item) => {
          // Enhanced active state check to include choose-shop for Stores
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            (item.href === "/shops" && pathname === "/choose-shop");

          return (
            <Link
              key={item.name}
              href={item.href as any}
              className="flex flex-col items-center gap-1 transition-all duration-200"
            >
              <div className="w-6 h-6">{renderIcon(item.icon, isActive)}</div>
              <span
                className="text-[12px] font-semibold leading-4 transition-colors duration-200"
                style={{
                  color: isActive
                    ? "var(--shelivery-primary-yellow)"
                    : "#FFFFFF",
                }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
