
import { handle, lambda } from "../../src";

describe('Lambda', () => {

	const fn = handle(
		lambda(),
		(app) => app.output = app.lambda
	);

	it('should expose the API', async () => {
		const api = await fn();
		expect(api.invoke).toBeDefined()
		// expect(lambda.invokeAsync).toBeDefined()
	});

});
