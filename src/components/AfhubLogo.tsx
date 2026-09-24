import React from "react";
import logoImg from "../assets/images/afhub_logo_africa_1787956612844.jpg";

interface AfhubLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: string;
}

export const AfhubLogo: React.FC<AfhubLogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  textColor = "text-white",
}) => {
  const sizeMap = {
    sm: "size-7",
    md: "size-8 sm:size-9",
    lg: "size-10 sm:size-11",
    xl: "size-12 sm:size-14",
  };

  const textMap = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`relative overflow-hidden rounded-xl border border-white/10 bg-black ${sizeMap[size]} shrink-0`}
      >
        <img
          src={logoImg}
          alt="afhub logo carte afrique"
          className="h-full w-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`font-black ${textMap[size]} ${textColor} tracking-tight font-sans`}>
            af<span className="text-[#00D26A]">hub</span>
          </span>
        </div>
      )}
    </div>
  );
};
