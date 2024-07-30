import globals from "globals";
import js from "@eslint/js";
import node from "eslint-plugin-node";

export default [
  {
    files: ["server/**/*.js"],
    languageOptions: { globals: globals.node },
    rules: {
      indent: ["warn", 2],
      "linebreak-style": ["error", "unix"],
      semi: ["error", "always"],
      "no-console": 0,
    },
  },
];
