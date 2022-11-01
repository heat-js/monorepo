
import { join, extname, basename } from 'path'
import { createHash } from 'crypto'
import { optimize } from 'svgo'
import svgstore from 'svgstore'
import fs from 'fs'

const hashKey = (value) => {
	return createHash('md5').update(value).digest('hex').substr(0, 8);
}

export default function VitePluginSVG() {
	const moduleId = 'virtual:svg:';
	const resolved = `\0${moduleId}`;
	const context = {};
	const watching = [];

	let aliases;
	let server;

	const watch = (file, id) => {
		if (!watching.includes(file)) {
			watching.push(file);
			fs.watchFile(file, () => {
				const module = server.moduleGraph.getModuleById(id);
				if (module) {
					server.moduleGraph.invalidateModule(module);
					console.log('SVG updated', id);
					server.ws.send({
						type: 'full-reload',
					});
				}
			});
		}
	}

	return {
		name: '@heat/vite-plugin-svg',
		resolveId(id) {
			if (id.startsWith(moduleId)) {
				return `\0${id}`;
			}
		},
		configResolved(config) {
			aliases = config.resolve.alias;
		},
		async load(id) {
			if (id.startsWith(resolved)) {

				const path = id.substr(resolved.length);
				const alias = aliases.find(alias => path.startsWith(alias.find));
				const resolvedPath = alias ? path.replace(alias.find, alias.replacement) : path;
				const prefix = basename(resolvedPath);
				const files = (await fs.promises.readdir(resolvedPath))
					.filter(file => extname(file) === '.svg')
					.map(file => join(resolvedPath, file))
					.sort();

				if (server) {
					watch(resolvedPath, id);
					files.forEach(file => watch(file, id));
				}

				const sprites = svgstore();
				const optimized = await Promise.all(files.map(async file => {
					const code = await fs.promises.readFile(file);
					const name = basename(file, '.svg');
					const data = optimize(code, {
						plugins: [
							'preset-default',
							'convertStyleToAttrs',
							{
								name: 'prefixIds',
								params: {
									prefix: name
								}
							}
						]
					}).data;

					return [name, data];
				}));

				optimized.forEach(([name, data]) => {
					sprites.add(name, data);
				})

				const source = sprites.toString();
				const key = `${prefix}-${hashKey(source)}.svg`;
				// const url = `/_app/immutable/${key}`;
				const url = `/${key}`;

				context[url] = {
					url,
					key,
					files,
					source
				};

				return `export default '${url}';`;
			}
		},
		configureServer(s) {
			server = s;

			server.middlewares.use(async (req, res, next) => {
				const url = req.url || '';
				const data = context[url];

				if (data) {
					res.setHeader('Content-Type', 'image/svg+xml');
					res.end(data.source);
					return;
				}

				next();
			})
		},
		generateBundle() {
			Object.values(context).forEach(data => {
				this.emitFile({
					type: 'asset',
					fileName: data.key,
					source: data.source
				});
			});
		}
	};
}
