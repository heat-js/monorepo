
import { handle, lambda } from "../../src";

describe('Lambda', () => {

	const fn = handle(
		lambda(),
		(app) => app.output = app.lambda
	);

	it('should expose the lambda API', async () => {
		const lambda = await fn();
		expect(lambda.invoke).toBeDefined()
		// expect(lambda.invokeAsync).toBeDefined()
	});

});
