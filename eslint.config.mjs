// @ts-check

import eslint from '@eslint/js'
import tsEsLint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import neostandard from 'neostandard'

export default tsEsLint.config(
	{ignores: ['node_modules', '.wrangler', 'dist', '.angular']},
	eslint.configs.recommended,
	...neostandard({
		noStyle: true,
		semi: false,
	}),
	tsEsLint.configs.recommended,
	tsEsLint.configs.strict,
	tsEsLint.configs.stylistic,
	eslintConfigPrettier,
)
