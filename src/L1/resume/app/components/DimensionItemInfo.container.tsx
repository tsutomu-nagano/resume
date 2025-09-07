import { useState, ReactNode, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ITEMS } from "@/lib/queries";
import { DimensionItemInfo } from "./DimensionItemInfo";

interface DimensionItemInfoContainerProps {
  kind: string;
  name: string;
  title: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function DimensionItemInfoContainer({
  kind,
  name,
  title,
  isOpen,
  onToggle,
}: DimensionItemInfoContainerProps) {
  const resource_name =
    kind === "dimension"
      ? "DIMENSION_ITEM"
      : kind === "region"
      ? "REGION_ITEM"
      : "";

  const { data, loading, error, refetch } = useQuery(
    GET_ITEMS(resource_name, name),
    { skip: !isOpen }
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen]);

  return (
    <span>TEST</span>
    // <DimensionItemInfo
    //   title={title}
    //   isOpen={isOpen}
    //   onToggle={onToggle}
      // loading={loading}
      // error={error instanceof Error ? error : null}
      // items={data?.item ?? []}
    // />
  );
}
