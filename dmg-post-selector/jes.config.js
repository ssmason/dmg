module.exports = {
    preset: '@wordpress/jest-preset-default',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!(@wordpress)/)',
    ],
};import '@testing-library/jest-dom';
