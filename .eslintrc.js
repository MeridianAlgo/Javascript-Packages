module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
    },
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-console': 'warn',
    },
    env: {
        node: true,
        es6: true,
        jest: true,
    },
    overrides: [
        {
            // Test files and standalone audit scripts legitimately use console
            // output and ad-hoc typing for fixtures.
            files: ['tests/**/*.ts', 'examples/**/*.ts'],
            rules: {
                'no-console': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
            },
        },
        {
            // The CLI's purpose is to print to stdout/stderr.
            files: ['src/cli/**/*.ts'],
            rules: {
                'no-console': 'off',
            },
        },
    ],
};
