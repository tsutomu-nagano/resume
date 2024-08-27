"use client";
import * as React from 'react';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  fetchMore: () => void;
  isLast: boolean;
}

export const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> =
  ({ children, fetchMore, isLast }) => {
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
        if (!isLast){
          console.log("Inf");
          fetchMore();
        }
        setNeedFetchMore(false);
      }
    }, [needFetchMore, fetchMore, setNeedFetchMore]);

    return (
      <div>
        {children}
        <div ref={bottomBoundaryRef} />
      </div>
    );
  };
