// src/app/ClientProvider.tsx
"use client"; // このファイルはクライアントサイドでのみ実行される

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/lib/apolloClient';
import { SearchItemProvider } from '@contexts/SearchItemsProvider';
import { Header } from '@components/Header'
import { Suspense } from "react";


const client = createApolloClient();

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <Suspense>
        <SearchItemProvider>
          <div className="flex flex-col gap-10">
            <Header />
            <main className="">{children}</main>
          </div>
        </SearchItemProvider>
      </Suspense>
    </ApolloProvider>
  );
}
