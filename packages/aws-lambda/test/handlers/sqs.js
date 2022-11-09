
import { handle, sqs } from "../../src";

describe('SQS', () => {

	const fn = handle(
		sqs(),
		(app) => app.output = app.sqs
	);

	it('should expose the API', async () => {
		const api = await fn();
		expect(api.send).toBeDefined()
	});

});
