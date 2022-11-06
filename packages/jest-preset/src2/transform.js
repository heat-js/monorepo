
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
// // import coffee from 'coffeescript'
import babelJest from 'babel-jest'
import { compile } from '@heat/compiler'

export default {
	// getCacheKey: (sourceText, sourcePath, configString) => {
	// 	return createHash("md5")
	// 		.update(sourceText)
	// 		.update("\0", "utf8")
	// 		.update(sourcePath)
	// 		.update("\0", "utf8")
	// 		.update(
	// 			typeof configString === "string"
	// 				? configString
	// 				: JSON.stringify(configString)
	// 		)
	// 		.update("\0", "utf8")
	// 		.update(readFileSync(sourcePath))
	// 		.digest("hex");
	// },

	process: (src, file, config, options) => {
		console.log(src);
	},
	processAsync: (src, file, config, options) => {
		console.log(src);
		// return new Promise((resolve) => {
		// 	return resolve({code:''});
		// });
		// result = await compile(file, { sourceMap: false })
		// console.log(result.code, result.map);

		// const v3SourceMap = JSON.parse(map);

		// const map = {
		// 	version: v3SourceMap.version,
		// 	sources: [file],
		// 	names: [],
		// 	mappings: v3SourceMap.mappings,
		// 	sourcesContent: [src],
		// };

		// const babelTransformer = babelJest.createTransformer({
		// 	inputSourceMap: map,
		// });

		// return babelTransformer.process(code, file, config, options);
	}
}


// export default {
	// getCacheKey: function (sourceText, sourcePath, configString) {
	// 	return createHash("md5")
	// 		.update(sourceText)
	// 		.update("\0", "utf8")
	// 		.update(sourcePath)
	// 		.update("\0", "utf8")
	// 		.update(
	// 			typeof configString === "string"
	// 				? configString
	// 				: JSON.stringify(configString)
	// 		)
	// 		.update("\0", "utf8")
	// 		.update(readFileSync(__filename))
	// 		.digest("hex");
	// },

// 	process: function (src, file, config, options) {
// 		var babelTransformer, code, map, ref, v3SourceMap;
// 		(ref = await(
// 			compile2(file, {
// 				sourceMap: false,
// 			})
// 		)),
// 			(code = ref.code),
// 			(map = ref.map);

// 		console.log(code, map);

// 		v3SourceMap = JSON.parse(map);

// 		map = {
// 			version: v3SourceMap.version,
// 			sources: [file],
// 			names: [],
// 			mappings: v3SourceMap.mappings,
// 			sourcesContent: [src],
// 		};

// 		babelTransformer = babelJest.createTransformer({
// 			inputSourceMap: map,
// 		});

// 		return babelTransformer.process(code, file, config, options);
// 	},
// };
