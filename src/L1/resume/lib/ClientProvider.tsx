// src/app/ClientProvider.tsx
"use client"; // このファイルはクライアントサイドでのみ実行される

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@lib/apolloClient";
import { SearchItemProvider } from "@contexts/SearchItemsProvider";
import { Header } from "@components/Header";
import { BackToTopButton } from "@components/BackToTopButton";
import { Suspense } from "react";

const client = createApolloClient();

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <Suspense>
        <SearchItemProvider>
          <div className="flex min-h-screen flex-col bg-base-200">
            <Header />
            <main className="min-w-0 flex-1 p-4">{children}</main>
            <BackToTopButton />
          </div>
        </SearchItemProvider>
      </Suspense>
    </ApolloProvider>
  );
}
