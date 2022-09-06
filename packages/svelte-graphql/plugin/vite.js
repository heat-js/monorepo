
import { parse, print, visit } from 'graphql';
import { camelCase } from 'change-case';
import { createHash } from 'crypto';

function hashKey(code) {
	return createHash('md5').update(code).digest('hex').substr(0, 6);
}

function getParams(directives) {
	for (const directive of directives) {
		if (directive.name.value === 'params') {
			return `{${print(directive.arguments).join(', ')}}`;
		}
	}
}

function getCode(schema, file) {
	const document = parse(schema.toString());

	const defs = document.definitions;
	const opDefs = defs.filter(({ kind }) => kind == 'OperationDefinition');
	const frDefs = defs.filter(({ kind }) => kind == 'FragmentDefinition');
	const hasQuery = opDefs.filter(({ operation }) => operation == 'query').length > 0;
	const hasMutation = opDefs.filter(({ operation }) => operation == 'mutation').length > 0;

	const fragments = frDefs.map((definition) => {
		const name = camelCase(definition.name.value + 'Fragment');
		const code = compress(print(definition));

		return `const ${name} = \`${code}\`;`;
	});

	const exports = opDefs.map((definition) => {
		const usedFragments = new Set();
		const params = getParams(definition.directives);

		visit(definition, {
			FragmentSpread: (node) => usedFragments.add(camelCase(node.name.value + 'Fragment'))
		});

		definition.directives = [];

		const type = definition.operation === 'query' ? 'Query' : 'Mutation';
		const queryName = camelCase(definition.name.value + type);
		const name = camelCase(definition.name.value);
		const schema = compress(print(definition));
		const includes = Array.from(usedFragments).map((frag) => {
			return `\${${frag}}`;
		});

		const code = [...includes, schema].join(' ');
		const lines = [''];

		lines.push(`export const ${queryName} = \`${code}\`;`);

		const options = [`'${name}-${hashKey(code)}'`, queryName];

		// const options = type === 'Query' ? [`'${name}-${hashKey(code)}'`, queryName] : [queryName];

		if (params) {
			options.push(params);
		}

		lines.push(`export const ${name} = ${type}(${options.join(', ')});`);

		return lines.join('\n');
	});

	const imports = [
		hasQuery && 'Query',
		hasMutation && 'Mutation',
	].filter(Boolean);

	return [
		`import {${imports.join(', ')}} from '@heat/svelte-graphql';`,
		'',
		...fragments,
		'',
		...exports
	].join('\n').replace(/\n{2,}/gm, '\n\n');
}

function compress(schema) {
	return schema
		.replace(/\s+/g, ' ')
		.replace(/(\s+)?([\:\,\{\}\(\)}])(\s+)?/g, (match, _, chr) => chr)
		.trim();
}

function transform(src, file) {
	if (file.endsWith('.graphql') || file.endsWith('.gql')) {
		return {
			code: getCode(src, file),
			map: null
		};
	}
}

export const graphql = () => {
	return {
		name: 'vite-plugin-graphql',
		transform
	};
}
