
import decode from 'jwt-decode'

export class Token {
	static fromString(tokenString) {
		return new Token(tokenString, decode(tokenString));
	}

	constructor(tokenString, payload) {
		this.token = tokenString;
		this.payload = payload;
	}

	getExpiration() {
		return this.payload.exp;
	}

	getIssuedAt() {
		return this.payload.iat;
	}

	getPayload() {
		return this.payload;
	}

	toString() {
		return this.token;
	}
}
