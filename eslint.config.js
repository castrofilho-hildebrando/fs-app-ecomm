import eslintPluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import globals from "globals"

export default [

    // 🔹 Ignore generated files
    {
        ignores: [
            "dist/**",                // compiled output
            "node_modules/**" // dependencies
        ],
    },

    // 🔹 Normal source files
    {
        files: ["**/*.js", "**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            ...eslintPluginJs.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            quotes: ["error", "double"],
            semi: ["error", "never"],
            indent: ["error", 4],
            "no-unused-vars": "off", // disable base rule
            "@typescript-eslint/no-unused-vars": ["error"], // TS-aware version
        },
    },

    // 🔹 Hand-written declaration files in src/@types
    {
        files: ["src/@types/**/*.d.ts"],
        rules: {
            // turn off unused-vars just for declarations
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
]
