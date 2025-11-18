module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      alias: {
        map: [["@", "./src"]],
        extensions: [".js", ".jsx"],
      },
    },
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "react/prop-types": "off",
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
      },
    ],
  },
};
