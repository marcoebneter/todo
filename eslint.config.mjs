import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import html from "@html-eslint/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: ["node_modules/**", "dist/**", "coverage/**"],
    },
    {
        files: ["code/public/scripts/**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
        },
        rules: {
            "no-console": "off",
            "no-alert": "warn",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["code/server/**/*.js", "scripts/**/*.{js,mjs,cjs}", "index.js"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.node,
        },
        rules: {
            "no-console": "off",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["code/public/**/*.css"],
        plugins: { css },
        language: "css/css",
        extends: ["css/recommended"],
        rules: {
            "css/no-invalid-properties": "off",
        },
    },
    {
        files: ["code/public/**/*.html"],
        ...html.configs["flat/recommended"],
        rules: {
            ...html.configs["flat/recommended"].rules,
            "@html-eslint/require-closing-tags": "off",
            "@html-eslint/attrs-newline": "off",
            "@html-eslint/no-extra-spacing-tags": "off",
        },
    },
]);
