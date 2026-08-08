"use client";
import * as React from 'react';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  fetchMore: () => void;
  isLast: boolean;
  isFetchingMore: boolean;
}

export const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> =
  ({ children, fetchMore, isLast, isFetchingMore }) => {
    // ボトム要素のRef、この Ref を監視(Observer)する
    const bottomBoundaryRef = React.useRef<HTMLDivElement | null>(null);
    const [needFetchMore, setNeedFetchMore] = React.useState(false);

    React.useEffect(() => {
      const node = bottomBoundaryRef.current;

      if (!node) {
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 時間がかかる重い処理はここに置かないように注意
            setNeedFetchMore(true);
          }
        });
      });

      observer.observe(node);

      return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
      if (!needFetchMore) {
        return;
      }

      if (isLast) {
        setNeedFetchMore(false);
        return;
      }

      if (isFetchingMore) {
        return;
      }

      void fetchMore();
      setNeedFetchMore(false);
    }, [needFetchMore, fetchMore, isFetchingMore, isLast, setNeedFetchMore]);

    return (
      <div>
        {children}
        <div
          aria-live="polite"
          className="flex min-h-16 items-center justify-center py-6"
        >
          {isFetchingMore && (
            <div className="flex items-center gap-3 text-sm text-base-content/70">
              <span className="loading loading-spinner loading-sm text-primary" />
              <span>追加データを読み込み中です</span>
            </div>
          )}
        </div>
        <div ref={bottomBoundaryRef} />
      </div>
    );
  };
