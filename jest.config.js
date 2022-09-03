/** @type {import('jest').Config} */
const config = {
    moduleNameMapper: {
        // see: https://github.com/kulshekhar/ts-jest/issues/414#issuecomment-517944368
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    moduleFileExtensions: ['json', 'js', 'jsx', 'ts', 'tsx', 'vue', "cjs"],
    moduleDirectories: ["node_modules", "src"],
};

module.exports = config;