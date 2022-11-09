
import { handle, event, validate, config, lambda, bugsnag, warmer } from "@heat/lambda";
import { uuid } from "@heat/lambda/types";
import { string } from "@heat/lambda/config";
import { object } from "superstruct";

const configuration = () => ({
	key: string('API_KEY')
});

export default handle(
	bugsnag(),
	warmer(),
	config(configuration),
	validate(object({ id: uuid() })),
	lambda(),
	event('before'),

	async (app) => {
		const response = await app.lambda.invoke({
			service: 'console',
			name: 'alert',
			payload: {}
		});

		app.output = response;
	}
)
