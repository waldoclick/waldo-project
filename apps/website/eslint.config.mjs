// src: eslint.config.mjs

import withNuxt from "./.nuxt/eslint.config.mjs";
import unicorn from "eslint-plugin-unicorn";

const isProduction = process.env.NODE_ENV === "production";
const isStaging = process.env.NODE_ENV === "staging";

export default withNuxt(
  // your custom flat configs go here, for example:
  {
    plugins: {
      unicorn,
    },
    rules: {
      // --- Unicorn Plugin Rules ---
      "unicorn/better-regex": "error",
      "unicorn/custom-error-definition": "error",
      "unicorn/error-message": "error",
      "unicorn/escape-case": "error",
      "unicorn/explicit-length-check": "error",
      "unicorn/new-for-builtins": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-array-callback-reference": "error",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-array-push-push": "error",
      "unicorn/no-array-reduce": "error",
      "unicorn/no-console-spaces": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/no-hex-escape": "error",
      "unicorn/no-lonely-if": "error",
      "unicorn/no-new-array": "error",
      "unicorn/no-new-buffer": "error",
      "unicorn/no-null": "off",
      "unicorn/no-object-as-default-parameter": "error",
      "unicorn/no-this-assignment": "error",
      "unicorn/no-unreadable-array-destructuring": "error",
      "unicorn/no-unused-properties": "error",
      "unicorn/no-useless-undefined": "error",
      "unicorn/no-zero-fractions": "error",
      "unicorn/number-literal-case": "error",
      "unicorn/prefer-add-event-listener": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-array-index-of": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-date-now": "error",
      "unicorn/prefer-default-parameters": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-math-trunc": "error",
      "unicorn/prefer-negative-index": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-optional-catch-binding": "error",
      "unicorn/prefer-set-has": "error",
      "unicorn/prefer-spread": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/prefer-string-trim-start-end": "error",
      "unicorn/prefer-ternary": "error",
      "unicorn/prefer-type-error": "error",
      "unicorn/throw-new-error": "error",

      // --- Production & Debugging Rules ---
      "no-console": isProduction ? "error" : isStaging ? "warn" : "off", // allow // console.log in TypeScript files

      // --- TypeScript Rules ---
      "@typescript-eslint/no-unused-vars": [
        "off",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // allow explicit any types
      "@typescript-eslint/no-empty-object-type": "off", // allow empty object types

      // --- Vue Core Rules ---
      "vue/no-mutating-props": "off", // do not allow mutating props
      "vue/no-dupe-keys": "off", // allow duplicate keys in Vue templates
      "vue/valid-template-root": "off", // allow non-self-closing tags
      "vue/valid-v-for": "off", // allow invalid v-for
      "vue/no-v-html": "off", // allow v-html
      "vue/no-unused-vars": "off", // allow unused vars in Vue templates
      "vue/no-deprecated-v-on-native-modifier": "off", // allow deprecated v-on.native
      "vue/prop-name-casing": "off", // allow camelCase props
      "vue/html-self-closing": "off", // allow non-self-closing tags
      "vue/no-required-prop-with-default": "off", // allow required props with default values
      "vue/require-explicit-emits": "off", // allow explicit emits

      // --- General JavaScript Rules ---
      "no-useless-catch": "off", // allow empty catch blocks
      "no-async-promise-executor": "off", // allow async promise executors
      "import/no-duplicates": "off", // allow duplicate imports
      "import/first": "off", // allow imports after code
      "no-empty": "off", // allow empty blocks
    },
  }
);
