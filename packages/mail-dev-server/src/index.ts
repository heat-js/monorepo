import { readdir } from 'fs/promises'
import { join } from 'path'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { render } from '@heat/mail-components'
import { importModule } from '@heat/code'

export const start = async ({
	path = './',
	port = 8080,
	args = {},
}: {
	path: string
	port?: number
	args?: object
}) => {
	const folder = join(process.cwd(), path)
	const files = await readdir(folder)

	const renderHome = () => {
		return `<html>
			<body>
				<h1>Layouts</h1>
				<ul>${files.map(file => `<li><a href='${file}'>${file}</a></li>`).join('')}</ul>
			</body>
		</html>`
	}

	const renderHtml = async (url: URL) => {
		const path = join(folder, url.pathname)
		const module = await importModule(path)

		return render(
			module({
				...args,
				...Object.fromEntries(url.searchParams),
			})
		)
	}

	const renderNotFound = () => {
		return '<h1>Not Found</h1><a href="/">home</a>'
	}

	const renderError = (error: Error) => {
		return `<h1>Error</h1><p>${error.message}</p>`
	}

	const renderPage = (url: URL) => {
		try {
			if (url.pathname === '/') {
				return renderHome()
			} else if (files.includes(url.pathname.replace(/^\//, ''))) {
				return renderHtml(url)
			} else {
				return renderNotFound()
			}
		} catch (error) {
			console.error(error)
			if (error instanceof Error) {
				return renderError(error)
			}
		}
	}

	const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
		const url = new URL(request.url || '/', `http://${request.headers.host}`)

		response.writeHead(200, { 'Content-type': 'text/html' })
		response.end(await renderPage(url))
	})

	server.listen(port)
	console.log('Mail Dev Server listening on port', port)
}
