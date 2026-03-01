import React from "react";
import Skeleton from "react-loading-skeleton";

type ShimmerBlockProps = {
  className?: string;
};

const ShimmerBlock: React.FC<ShimmerBlockProps> = ({ className = "" }) => (
  <Skeleton className={className} borderRadius={12} />
);

export const ProjectsPageShimmer: React.FC = () => (
  <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <section className="space-y-2">
        <ShimmerBlock className="h-10 w-52" />
        <ShimmerBlock className="h-5 w-96 max-w-full" />
      </section>
      <ShimmerBlock className="h-20 w-full rounded-2xl" />
      <section className="space-y-4">
        <ShimmerBlock className="h-36 w-full rounded-2xl" />
        <ShimmerBlock className="h-36 w-full rounded-2xl" />
        <ShimmerBlock className="h-36 w-full rounded-2xl" />
      </section>
    </div>
  </main>
);

export const ProjectDetailsPageShimmer: React.FC = () => (
  <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <section className="space-y-2">
        <ShimmerBlock className="h-5 w-36" />
        <ShimmerBlock className="h-10 w-72 max-w-full" />
        <ShimmerBlock className="h-5 w-3/4" />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <ShimmerBlock className="h-24 w-full rounded-2xl" />
        <ShimmerBlock className="h-24 w-full rounded-2xl" />
        <ShimmerBlock className="h-24 w-full rounded-2xl" />
        <ShimmerBlock className="h-24 w-full rounded-2xl" />
      </section>
      <ShimmerBlock className="h-24 w-full rounded-2xl" />
      <ShimmerBlock className="h-80 w-full rounded-2xl" />
    </div>
  </main>
);

export const MyTasksPageShimmer: React.FC = () => (
  <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="space-y-2">
        <ShimmerBlock className="h-10 w-48" />
        <ShimmerBlock className="h-5 w-96 max-w-full" />
      </section>
      <ShimmerBlock className="h-28 w-full rounded-2xl" />
      <section className="space-y-4">
        <ShimmerBlock className="h-44 w-full rounded-2xl" />
        <ShimmerBlock className="h-44 w-full rounded-2xl" />
      </section>
    </div>
  </main>
);

export const DashboardPageShimmer: React.FC = () => (
  <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="space-y-2">
        <ShimmerBlock className="h-10 w-56" />
        <ShimmerBlock className="h-5 w-96 max-w-full" />
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ShimmerBlock className="h-28 w-full rounded-2xl" />
        <ShimmerBlock className="h-28 w-full rounded-2xl" />
        <ShimmerBlock className="h-28 w-full rounded-2xl" />
        <ShimmerBlock className="h-28 w-full rounded-2xl" />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShimmerBlock className="h-72 w-full rounded-2xl" />
        <ShimmerBlock className="h-72 w-full rounded-2xl" />
      </section>
      <ShimmerBlock className="h-80 w-full rounded-2xl" />
    </div>
  </main>
);
