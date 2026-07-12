// src/app/ClientProvider.tsx
"use client"; // このファイルはクライアントサイドでのみ実行される

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@lib/apolloClient";
import { SearchItemProvider } from "@contexts/SearchItemsProvider";
import { Header } from "@components/Header";
import { SearchHistoryPanel } from "@components/SearchHistoryPanel";
import { Suspense } from "react";

const client = createApolloClient();

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <Suspense>
        <SearchItemProvider>
          <div className="flex min-h-screen flex-col bg-base-200">
            <Header />
            <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
              <aside className="rounded-md bg-base-100 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                <SearchHistoryPanel />
              </aside>
              <main className="min-w-0 flex-1">{children}</main>
            </div>
          </div>
        </SearchItemProvider>
      </Suspense>
    </ApolloProvider>
  );
}
