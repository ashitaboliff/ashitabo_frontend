export default {
  backend: {
    input: {
      target: 'http://localhost:8787/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/lib/api',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/lib/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
} as const
