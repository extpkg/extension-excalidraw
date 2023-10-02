module.exports = {
  env: { browser: true, commonjs: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest'
  },
  plugins: [
    'react-refresh',
    '@typescript-eslint'
  ],
  rules: {
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    '@typescript-eslint/no-explicit-any': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ]
  },
  ignorePatterns: [
    'webpack.config.js',
    'webpack.ext.js',
    'dist/*',
    'src/source/'
  ]
}
