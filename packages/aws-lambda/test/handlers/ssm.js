
import { handle, ssm } from "../../src";

describe('SSM', () => {

	const fn = handle(ssm());

	it('should resolve ssm values inside process.env', async () => {
		const lambda = await fn();
	});

});
