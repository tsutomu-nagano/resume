// src/app/ClientProvider.tsx
"use client"; // このファイルはクライアントサイドでのみ実行される

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/lib/apolloClient';

const client = createApolloClient();

export default function ClientProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
