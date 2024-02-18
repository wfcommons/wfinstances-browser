/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },

  // Base config
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ],

  overrides: [
    // React
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:react/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" },
        ],
        "import/resolver": {
          typescript: {},
        },
      },
    },

    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime"
      ],
    },

    // Node
    {
      files: [".eslintrc.js"],
      env: {
        node: true,
      },
    },
  ],

  rules: {
    'arrow-parens': 'off',
    camelcase: 'off',
    'class-methods-use-this': 'off',
    'func-names': 'off',
    'import/no-absolute-path': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/imports-first': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    indent: ['error', 2],
    'linebreak-style': 'off',
    'max-len': ['error', 250],
    'no-confusing-arrow': ['error', { allowParens: true }],
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
    'object-shorthand': 'off',
    'operator-linebreak': 'off',
    'padded-blocks': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-destructuring': 'off',
    'prefer-promise-reject-errors': 'off',
    'react/function-component-definition': [2, { namedComponents: 'function-declaration' }],
    'react/jsx-one-expression-per-line': 'off',
    'react/no-array-index-key': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
};
