
module.exports = {
	root: true,
	extends: [
		"prettier",
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking"
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier"],
	env: {
		browser: true,
		node: true,
		es6: true
	},
	parserOptions: {
		ecmaVersion: 2018,
		// sourceType: "module",
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
	},
	rules: {
		// "prettier/prettier": ["error"],
		// "no-tabs": ["warn", { "allowIndentationTabs": true }],
		semi: ["warn", "never"],
		quotes: ["warn", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
		indent: ["warn", "tab"],
		"object-property-newline": ["warn", { "allowAllPropertiesOnSameLine": true }],
		"no-multiple-empty-lines": ["warn", { "max": 2, "maxEOF": 1, "maxBOF": 1 }],
		"no-mixed-operators": ["warn"],
		"no-multi-spaces": ["warn"],
		"require-await": ["error"],
		"no-return-await": ["error"],
		"no-empty-function": "off",

		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-floating-promises": ["error"],
		"@typescript-eslint/semi": ["warn", "never"],
		"@typescript-eslint/member-delimiter-style": [
			"warn",
			{
				multiline: { "delimiter": "none" },
				singleline: { "delimiter": "comma" }
			}
		]
	}
}
