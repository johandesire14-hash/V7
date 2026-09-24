import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rounded",
  style,
}) => {
  const variantClasses = {
    text: "h-3 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  return (
    <div
      style={style}
      className={`relative overflow-hidden bg-white/[0.06] ${variantClasses[variant]} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
    </div>
  );
};

export const MarketplaceCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#101114] p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="size-10 shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>

        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const DashboardMetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/[0.08] bg-[#101114] p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton variant="circular" className="size-6" />
          </div>
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const DashboardProductsSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101114] overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>

      <div className="divide-y divide-white/[0.06]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Skeleton className="size-10 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end space-y-1">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-2.5 w-12" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardPulseSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101114] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="size-3" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#14161c]"
          >
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="size-8 shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101114] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-36" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-7 w-12 rounded-md" />
        </div>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
        {[40, 65, 30, 85, 55, 95, 70, 45, 80, 100, 60, 90].map((height, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${height}%` }}
            />
            <Skeleton className="h-2.5 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
};
