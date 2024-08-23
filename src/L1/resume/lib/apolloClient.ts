// lib/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';



export const createApolloClient = () => {

    return new ApolloClient({
    link: new HttpLink({
      uri: 'https://statmetadata.hasura.app/v1/graphql',
      headers: {
        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || "",
      },
    }),
    cache: new InMemoryCache(),
  });
};