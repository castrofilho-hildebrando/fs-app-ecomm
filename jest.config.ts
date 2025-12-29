import type { Config } from "jest"

// Força NODE_ENV=test no momento em que o Jest carrega a config
process.env.NODE_ENV = "test"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",

    testMatch: [
        "**/tests/**/*.spec.ts",
        "**/tests/**/*.test.ts",
    ],

    transform: {
        "^.+\\.ts$": "ts-jest",
    },

    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
    ],

    coverageDirectory: "coverage",

    verbose: true,

    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
}

export default config
