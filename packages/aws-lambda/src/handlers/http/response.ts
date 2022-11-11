import { Request } from "./request";

interface Headers {
	[key:string]: string|number|[string|number]
}

interface ResponseOptions {
	status?: number;
	headers?: Headers;
}

export class Response {
	readonly headers: Headers
	status: number
	body: any

	constructor(body, { status = 200, headers = {} }:ResponseOptions = {}) {
		this.body = body;
		this.status = status;
		this.headers = headers;
	}

	format(request:Request) {
		const body = this.body;
		const status = this.status;
		const headers = this.headers;

		if(request.method === 'HEAD') {
			return { status, headers };
		}

		return { body, status, headers };
	}
}

export class ClientErrorResponse extends Response {

}

interface JsonResponseOptions extends ResponseOptions {
	charset?: string
	stringify?: (body: any) => string
}

export class JsonResponse extends Response {
	constructor(body, { status = 200, headers = {}, charset = 'utf-8', stringify = JSON.stringify.bind(JSON) }:JsonResponseOptions = {}) {
		const json = stringify(body);
		super(json, {
			status,
			headers: {
				'content-type': `application/json; charset=${ charset }`,
				'content-length': Buffer.from(json).length,
				...headers
			}
		});
	}
}

export class RedirectResponse extends Response {
	constructor(location, { status = 302, headers = {} } = {}) {
		super(undefined, {
			status,
			headers: {
				location,
				...headers
			}
		});
	}
}
