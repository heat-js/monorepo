import path from "path";
import { fileURLToPath } from 'url';
import { FILE_EXTENSIONS } from "coffeescript";

let obj = {}
const javascriptExtensions = ["js", "mjs", "cjs", "jsx"];
const coffeescriptExtensions = FILE_EXTENSIONS.map((ext) => {
	return ext.slice(1);
});

const extensions = [...javascriptExtensions, ...coffeescriptExtensions];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	moduleFileExtensions: ["md", "html", "json", ...extensions],

	testMatch: [
		path.join(process.cwd(), `test/**/*.@(${extensions.join("|")})`),
	],

	testEnvironment: "node",

	// dependencyExtractor: path.join(__dirname, 'dependencyExtractor.js'),

	transform:
		((obj = {
			"^.+\\.(md|html)$": "@heat/jest-raw-loader",
		}),
		(obj["^.+\\.(" + coffeescriptExtensions.join("|") + ")$"] = path.join(
			__dirname,
			"transform.js"
		)),
		(obj["^.+\\.(" + javascriptExtensions.join("|") + ")$"] = [
			"babel-jest",
			{
				plugins: ["@babel/plugin-syntax-jsx"],
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								node: "current",
							},
						},
					],
					[
						"@babel/preset-react",
						{
							pragma: "h",
							pragmaFrag: "Fragment",
							throwIfNamespace: false,
						},
					],
				],
			},
		]),
		obj),
};
