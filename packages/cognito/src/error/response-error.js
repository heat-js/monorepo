
export default class ResponseError extends Error {
	constructor(message, code) {
		super(message);
		this.code = code
	}
}
