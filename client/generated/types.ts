import { GraphQLClient, RequestOptions } from "graphql-request";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Mutation = {
  __typename?: "Mutation";
  addTodo: Todo;
  deleteTodo?: Maybe<Scalars["Boolean"]["output"]>;
  updateTodo?: Maybe<Todo>;
};

export type MutationAddTodoArgs = {
  text: Scalars["String"]["input"];
};

export type MutationDeleteTodoArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateTodoArgs = {
  completed: Scalars["Boolean"]["input"];
  id: Scalars["ID"]["input"];
};

export type Query = {
  __typename?: "Query";
  todos: Array<Todo>;
};

export type Todo = {
  __typename?: "Todo";
  completed: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  text: Scalars["String"]["output"];
};

export type AddTodoMutationVariables = Exact<{
  text: Scalars["String"]["input"];
}>;

export type AddTodoMutation = {
  __typename?: "Mutation";
  addTodo: {
    __typename?: "Todo";
    id: string;
    text: string;
    completed: boolean;
  };
};

export type GetTodosQueryVariables = Exact<{ [key: string]: never }>;

export type GetTodosQuery = {
  __typename?: "Query";
  todos: Array<{
    __typename?: "Todo";
    id: string;
    text: string;
    completed: boolean;
  }>;
};

export type TodoFragmentFragment = {
  __typename?: "Todo";
  id: string;
  text: string;
  completed: boolean;
};

export type UpdateTodoMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  completed: Scalars["Boolean"]["input"];
}>;

export type UpdateTodoMutation = {
  __typename?: "Mutation";
  updateTodo?: {
    __typename?: "Todo";
    id: string;
    text: string;
    completed: boolean;
  } | null;
};

export const TodoFragmentFragmentDoc = `
    fragment TodoFragment on Todo {
  id
  text
  completed
}
    `;
export const AddTodoDocument = `
    mutation AddTodo($text: String!) {
  addTodo(text: $text) {
    ...TodoFragment
  }
}
    ${TodoFragmentFragmentDoc}`;
export const GetTodosDocument = `
    query GetTodos {
  todos {
    ...TodoFragment
  }
}
    ${TodoFragmentFragmentDoc}`;
export const UpdateTodoDocument = `
    mutation UpdateTodo($id: ID!, $completed: Boolean!) {
  updateTodo(id: $id, completed: $completed) {
    ...TodoFragment
  }
}
    ${TodoFragmentFragmentDoc}`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    AddTodo(
      variables: AddTodoMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"]
    ): Promise<AddTodoMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AddTodoMutation>({
            document: AddTodoDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "AddTodo",
        "mutation",
        variables
      );
    },
    GetTodos(
      variables?: GetTodosQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"]
    ): Promise<GetTodosQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetTodosQuery>({
            document: GetTodosDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GetTodos",
        "query",
        variables
      );
    },
    UpdateTodo(
      variables: UpdateTodoMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"]
    ): Promise<UpdateTodoMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateTodoMutation>({
            document: UpdateTodoDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateTodo",
        "mutation",
        variables
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
