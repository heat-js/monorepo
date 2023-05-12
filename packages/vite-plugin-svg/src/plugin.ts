import type { Plugin, ViteDevServer } from 'vite'
import { extname, basename, resolve } from 'path'
import { createHash } from 'crypto'
import fs from 'fs'
import recursive from 'recursive-readdir'
import { optimize } from 'svgo'
import type { Config } from 'svgo'
import svgstore from 'svgstore'

interface VitePluginSVGOptions {
	path: string
	config?: Config
}

export default function VitePluginSVG({ path, config }: VitePluginSVGOptions): Plugin {
	type Context = Record<
		string,
		{
			url: string
			key: string
			files: string[]
			source: string
		}
	>

	const moduleId = 'virtual:svg'
	const resolved = `\0${moduleId}`
	const context: Context = {}
	const watching: string[] = []

	let server: ViteDevServer

	const watch = (file: string, id: string) => {
		if (!watching.includes(file)) {
			watching.push(file)
			fs.watchFile(file, () => {
				const module = server.moduleGraph.getModuleById(id)
				if (module) {
					server.moduleGraph.invalidateModule(module)
					console.log('SVG updated', id)
					server.ws.send({
						type: 'full-reload',
					})
				}
			})
		}
	}

	const hashKey = (value: string) => {
		return createHash('md5').update(value).digest('hex').substring(0, 8)
	}

	return {
		name: 'vite-plugin-svg',
		resolveId(id) {
			if (id.startsWith(moduleId)) {
				return `\0${id}`
			}
		},
		async load(id) {
			if (id.startsWith(resolved)) {
				// const path = id.substring(resolved.length)
				const resolvedPath = resolve(path)
				const files = (await recursive(resolvedPath)).filter(file => extname(file) === '.svg')

				if (server) {
					watch(resolvedPath, id)
					files.forEach(file => watch(file, id))
				}

				const optimized = await Promise.all(
					files.map(async file => {
						const code = await fs.promises.readFile(file, 'utf-8')
						const name = basename(file, '.svg')
						const { data } = optimize(
							code,
							Object.assign(
								{
									path: 'path-to.svg',
									multipass: true,
									plugins: [
										'preset-default',
										'convertStyleToAttrs',
										{
											name: 'prefixIds',
											params: {
												prefix: name,
											},
										},
									],
								},
								config
							)
						)

						return [name, data]
					})
				)

				const sprites = svgstore()
				optimized.forEach(([name, data]) => {
					sprites.add(name, data)
				})
				const source = sprites.toString()

				const prefix = basename(resolvedPath)
				const key = `${prefix}-${hashKey(source)}.svg`
				const url = `/${key}`

				context[url] = {
					url,
					key,
					files,
					source,
				}

				return `export default '${url}';`
			}
		},
		configureServer(s) {
			server = s
			server.middlewares.use((req, res, next) => {
				const url = req.url || ''
				const data = context[url]

				if (data) {
					res.setHeader('Content-Type', 'image/svg+xml')
					res.end(data.source)
					return
				}

				next()
			})
		},
		generateBundle() {
			Object.values(context).forEach(data => {
				this.emitFile({
					type: 'asset',
					fileName: data.key,
					source: data.source,
				})
			})
		},
	}
}
