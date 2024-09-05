// lib/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { GET_DIMENSION_ITEMS } from './queries';

export const createApolloClient = () => {
    return new ApolloClient({
    link: new HttpLink({
      // uri: 'https://statmetadata.hasura.app/v1/graphql',
      uri: 'https://assuring-phoenix-83.hasura.app/v1/graphql',
      headers: {
        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || "",
      },
    }),
    cache: new InMemoryCache(),
  });
};


export const fetchDimensionItems = async (name: string) => {
  const client = createApolloClient();
  const { data } = await client.query({
    query: GET_DIMENSION_ITEMS(name)
  });
  return data.dimension_item;
};