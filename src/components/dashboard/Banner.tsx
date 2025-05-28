import Image from "next/image";

interface BannerProps {
  className?: string;
}

export default function Banner({ className = "" }: BannerProps) {
  const banners = [
    {
      id: 1,
      bgColor: "#D22131",
      image: "/banners/banner-1.jpg",
      alt: "Banner 1",
    },
    {
      id: 2,
      bgColor: "#F78320",
      image: "/banners/banner-2.jpg",
      alt: "Banner 2",
    },
    {
      id: 3,
      bgColor: "#DD2024",
      image: "/banners/banner-3.jpg",
      alt: "Banner 3",
    },
  ];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="w-full h-[172px] rounded-[20px] relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: banner.bgColor }}
        >
          <Image
            src={banner.image}
            alt={banner.alt}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
