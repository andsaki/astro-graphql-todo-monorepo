import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:4000/graphql', // Assuming server is running here
  documents: ['src/App.tsx', 'src/graphql.ts'], // Change this line
  generates: {
    './generated/types.ts': { // Generate all types into a single types.ts file
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        documentMode: 'string',
      },
    },
    './generated/schema.json': { // Generate introspection schema as JSON
      plugins: ['introspection'],
    },
  },
};

export default config;
