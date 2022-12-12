
import { Request } from './request'

type Charset = 'utf-8' | 'ascii' | 'hex'

interface Headers {
	[ key:string ]: string | number | [ string | number ]
}

export class Response {
	private headers: Headers
	private status: number = 200
	private body: string

	set(header:string, value:string) {
		this.headers[header.toLowerCase()] = value
	}

	json (body:string, charset:Charset = 'utf-8') {
		this.set('content-type', `application/json; charset=${ charset }`)
		this.set('content-length', String(Buffer.from(body, charset).length))
		this.body = body
	}

	format(request:Request) {
		const body = this.body
		const status = this.status
		const headers = this.headers

		if(request.method === 'HEAD') {
			return { status, headers }
		}

		return { body, status, headers }
	}
}
