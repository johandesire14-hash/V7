import React from "react";
import * as Flags from "country-flag-icons/react/3x2";

interface CountryFlagProps {
  countryCode: string;
  className?: string;
  title?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = "w-5 h-3.5 rounded-[2px] object-cover inline-block shrink-0 shadow-xs",
  title,
}) => {
  const code = (countryCode || "").toUpperCase().trim();
  const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[code];

  if (!FlagComponent) {
    // Fallback if country code is not found
    return (
      <span className="inline-flex items-center justify-center text-xs font-mono font-bold px-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
        {code || "🌍"}
      </span>
    );
  }

  return <FlagComponent className={className} title={title || code} />;
};
