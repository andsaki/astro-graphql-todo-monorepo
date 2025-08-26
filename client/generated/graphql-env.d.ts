// This file is manually created to provide the introspection type for gql.tada
// It imports the introspection result from the generated schema.json.

declare module '@generated/graphql-env' {
  // Assuming the schema.json contains a top-level 'data' field with '__schema'
  // You might need to adjust this path based on the actual structure of schema.json
  import { data } from '../schema.json';

  export type introspection = typeof data.__schema;
}
