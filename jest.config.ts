/*
 * This file is released under the MIT license.
 * Copyright (c) 2023 Mike Lischke
 *
 * See LICENSE file for more info.
 */

import type { Config } from "jest";

const config: Config = {
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/tests/**",
        "!**/node_modules/**",
    ],

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",

    // An array of regexp pattern strings used to skip coverage collection
    // coveragePathIgnorePatterns: [
    //   "/node_modules/"
    // ],

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: "v8",

    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: [
        "json",
        "text",
        "clover",
        "html",
    ],

    // An object that configures minimum threshold enforcement for coverage results
    coverageThreshold: {
        global: {
            "statements": 54,
            "branches": 49,
            "functions": 43,
            "lines": 54
        },
    },

    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: [
        "node_modules"
    ],

    workerIdleMemoryLimit: "500MB",

    // An array of file extensions your modules use
    moduleFileExtensions: [
        "ts",
        "js",
        "mjs",
        "cjs",
        "json",
    ],

    extensionsToTreatAsEsm: [".ts"],

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources
    // with a single module
    moduleNameMapper: {
        "(.+)\\.js": "$1"
    },

    // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module
    // loader
    // modulePathIgnorePatterns: [],

    // Activates notifications for test results
    // notify: false,

    // An enum that specifies notification mode. Requires { notify: true }
    // notifyMode: "failure-change",

    // A preset that is used as a base for Jest's configuration
    preset: "ts-jest/presets/js-with-ts-esm",

    // Run tests from one or more projects
    // projects: undefined,

    // Use this configuration option to add custom reporters to Jest
    // reporters: undefined,

    // Automatically reset mock state before every test
    resetMocks: false,

    // Reset the module registry before running each individual test
    // resetModules: false,

    // A path to a custom resolver
    // resolver: undefined,

    // Automatically restore mock state and implementation before every test
    // restoreMocks: false,

    // The root directory that Jest should scan for tests and modules within
    // rootDir: undefined,

    // A list of paths to directories that Jest should use to search for files in
    roots: [
        "tests",
    ],

    // Allows you to use a custom runner instead of Jest's default test runner
    // runner: "jest-runner",

    // The paths to modules that run some code to configure or set up the testing environment before each test
    // setupFiles: [],

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: [
        // Note: this is not optimal. This setup is run again for every test file, while we actually want to
        // run it only once.
        //"./src/tests/setupTestEnv.ts",
    ],

    // The number of seconds after which a test is considered as slow and reported as such in the results.
    // slowTestThreshold: 5,

    // A list of paths to snapshot serializer modules Jest should use for snapshot testing
    // snapshotSerializers: [],

    // The test environment that will be used for testing
    testEnvironment: "node",

    // Options that will be passed to the testEnvironment
    testEnvironmentOptions: {},

    // Adds a location field to test results
    // testLocationInResults: false,

    // The glob patterns Jest uses to detect test files
    testMatch: [
        "**/tests/**/*.spec.ts",
    ],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: [
        //"[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$",
        //"^.+\\.module\\.(css|sass|scss)$",
    ],

    // The regexp pattern or array of patterns that Jest uses to detect test files
    // testRegex: [],

    // This option allows the use of a custom results processor
    // testResultsProcessor: undefined,

    // This option allows use of a custom test runner
    // testRunner: "jest-circus/runner",

    // CI machines can be slow.
    testTimeout: 30000,

    // A map from regular expressions to paths to transformers
    transform: {
        '\\.ts?$': ['ts-jest', { useESM: true }]
    },

    // An array of regexp pattern strings that are matched against all source file paths, matched files will skip
    // transformation
    transformIgnorePatterns: [
        "node_modules/",
    ],

    // An array of regexp pattern strings that are matched against all modules before the module loader will
    // automatically return a mock for them
    // unmockedModulePathPatterns: undefined,

    // Indicates whether each individual test should be reported during the run
    // verbose: undefined,

    // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
    // watchPathIgnorePatterns: [],

    // Whether to use watchman for file crawling
    // watchman: true,
};

export default config;
