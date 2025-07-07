import tseslint from 'typescript-eslint'
import js from '@eslint/js'
import hooks from 'eslint-plugin-react-hooks'

export default tseslint.config([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  hooks.configs['recommended-latest'],
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['node_modules', 'dist', '**/*.js'],
    languageOptions: { 
      ecmaVersion: 2022, 
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        MutationObserver: 'readonly'
      }
    },
    plugins: { hooks },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-undef': 'off'
    }
  }
])