"use client";

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
  const resourceName =
    kind === "dimension"
      ? "DIMENSION_ITEM"
      : kind === "region"
      ? "REGION_ITEM"
      : "DIMENSION_ITEM";
  const shouldSkipQuery = !isOpen || (kind !== "dimension" && kind !== "region");
  const itemRequest = GET_ITEMS(resourceName, name);

  const { data, loading, error, refetch } = useQuery(
    itemRequest.query,
    { variables: itemRequest.variables, skip: shouldSkipQuery }
  );

  useEffect(() => {
    if (!shouldSkipQuery) {
      refetch();
    }
  }, [shouldSkipQuery, refetch]);

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
