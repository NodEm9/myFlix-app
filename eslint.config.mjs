/**
 * @type {import("eslint").Linter.Config}
 * @see {@link https://eslint.org/docs/user-guide/configuring}
 * @see {@link https://eslint.org/docs/user-guide/configuring/language-options}
 */
import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
];