import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "../lib/graphql";

interface ApolloWrapperProps {
  children: React.ReactNode;
}

const ApolloWrapper: React.FC<ApolloWrapperProps> = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;
