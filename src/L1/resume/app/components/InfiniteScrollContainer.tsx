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
    let bottomBoundaryRef = React.useRef(null);
    const [needFetchMore, setNeedFetchMore] = React.useState(false);

    const scrollObserver = React.useCallback(
      (node: any) => {
        new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              // 時間がかかる重い処理はここに置かないように注意
              setNeedFetchMore(true);
            }
          });
        }).observe(node);
      },
      [fetchMore]
    );

    React.useEffect(() => {
      if (bottomBoundaryRef.current) {
        scrollObserver(bottomBoundaryRef.current);
      }
    }, [scrollObserver, bottomBoundaryRef]);

    React.useEffect(() => {
      if (needFetchMore) {
        if (!isLast && !isFetchingMore) {
          void fetchMore();
        }
        setNeedFetchMore(false);
      }
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
