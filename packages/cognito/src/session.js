
export class Session {

	constructor({ idToken, accessToken, clockDrift }) {
		this.idToken = idToken;
		this.accessToken = accessToken;
		this.clockDrift = typeof clockDrift !== 'undefined' ? clockDrift : this.calculateClockDrift();
	}

	getUser() {
		const idToken = this.idToken.getPayload();
		const accessToken = this.accessToken.getPayload();

		return {
			id: idToken.sub,
			name: accessToken.username,
			email: idToken.email,
			deviceKey: accessToken.device_key,
		};
	}

	calculateClockDrift() {
		const now = Math.floor(Date.now() / 1000);
		const iat = Math.min(
			this.accessToken.getIssuedAt(),
			this.idToken.getIssuedAt()
		);

		return now - iat;
	}

	isValid() {
		const expireWindow = 60;
		const now = Math.floor(Date.now() / 1000);
		const adjusted = now - this.clockDrift + expireWindow;

		return (
			adjusted < this.accessToken.getExpiration() &&
			adjusted < this.idToken.getExpiration()
		);
	}
}
