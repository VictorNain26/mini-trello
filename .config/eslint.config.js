import tseslint from 'typescript-eslint'
import react    from '@eslint/js'
import hooks    from 'eslint-plugin-react-hooks'

export default tseslint.config([
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['node_modules', 'dist'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    extends: [
      react.configs.recommended,
      tseslint.configs.strictTypeChecked,
      hooks.configs['recommended-latest'],
      'plugin:prettier/recommended'
    ],
    plugins: { hooks },
  }
])
