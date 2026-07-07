"use client";

import type { SearchResultView } from "../contexts/SearchItemsContext";

function SkeletonLine({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

function SkeletonPill({ className = "w-24" }: { className?: string }) {
  return <div className={`skeleton h-7 rounded-full ${className}`} />;
}

function TableResultSkeleton() {
  return (
    <article className="card bg-base-100 w-full shadow-xl" aria-hidden="true">
      <div className="card-body gap-5">
        <div className="flex flex-wrap gap-5">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-24" />
        </div>
        <div className="space-y-3">
          <SkeletonLine className="h-6 w-11/12 max-w-3xl" />
          <SkeletonLine className="h-6 w-8/12 max-w-2xl" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonPill className="w-24" />
          <SkeletonPill className="w-32" />
          <SkeletonPill className="w-28" />
        </div>
        <div className="card-actions justify-end">
          <SkeletonLine className="h-12 w-40 rounded-btn" />
        </div>
      </div>
    </article>
  );
}

function SurveyResultSkeleton() {
  return (
    <article className="card bg-base-100 w-full shadow-xl" aria-hidden="true">
      <div className="card-body gap-4">
        <div className="flex flex-wrap gap-5">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-36" />
          <SkeletonLine className="h-4 w-28" />
        </div>
        <SkeletonLine className="h-7 w-10/12 max-w-2xl" />
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-full max-w-4xl" />
          <SkeletonLine className="h-4 w-9/12 max-w-3xl" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonPill className="w-28" />
          <SkeletonPill className="w-24" />
          <SkeletonPill className="w-32" />
        </div>
        <div className="card-actions items-center justify-between">
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="h-12 w-32 rounded-btn" />
        </div>
      </div>
    </article>
  );
}

function MetadataResultSkeleton() {
  return (
    <article className="card bg-base-100 shadow-md" aria-hidden="true">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between">
          <SkeletonPill className="w-24" />
          <SkeletonLine className="h-9 w-24 rounded-btn" />
        </div>
        <SkeletonLine className="h-5 w-11/12" />
        <SkeletonLine className="h-5 w-7/12" />
      </div>
    </article>
  );
}

export function ResultSkeletons({ view }: { view: SearchResultView }) {
  if (view === "metadata") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <MetadataResultSkeleton key={index} />
        ))}
        <span className="sr-only">検索結果を読み込み中です</span>
      </div>
    );
  }

  const Skeleton =
    view === "surveys" ? SurveyResultSkeleton : TableResultSkeleton;
  const gapClass = view === "surveys" ? "gap-y-6" : "gap-y-10";

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`flex flex-col ${gapClass}`}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} />
      ))}
      <span className="sr-only">検索結果を読み込み中です</span>
    </div>
  );
}
