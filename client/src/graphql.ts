import { initGraphQLTada } from 'gql.tada';
import type { introspection } from '@generated/graphql-env';

export type SetupSchema = {
  introspection: introspection;
  scalars: {
    URL: string;
    Timestamp: number;
  };
};

export const graphql = initGraphQLTada<SetupSchema>();

export type { FragmentOf, ResultOf } from 'gql.tada';
export { maskFragments, readFragment } from 'gql.tada';


