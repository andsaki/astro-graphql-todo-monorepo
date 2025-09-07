import { gql } from "../lib/graphql";

export const GET_TODOS = gql`
  query GetTodos($term: String, $sort: SortOrder) {
    todos(term: $term, sort: $sort) {
      id
      text
      completed
    }
  }
`;
