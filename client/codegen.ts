import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4002/graphql",
  documents: ["src/**/*.astro", "src/**/*.tsx"],
  generates: {
    "src/generated/types.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
      config: {
        useTypeImports: true,
      },
    },
    "src/generated/schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
