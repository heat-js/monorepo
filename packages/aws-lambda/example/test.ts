
import { handle, event, validate, config, lambda, Lambda, bugsnag, warmer } from "@heat/lambda";
import { uuid } from "@heat/aws-lambda/validate";
import { string } from "@heat/aws-lambda/env";
import { object } from "superstruct";

const configuration = () => ({
	key: string('API_KEY')
});

export default handle(
	bugsnag(),
	warmer(),
	config(configuration),
	validate(object({
		id: uuid()
	})),
	lambda(),
	event('before'),

	async (app) => {
		const response = await (app.lambda as Lambda).invoke({
			service: 'console',
			name: 'alert',
			payload: {}
		});

		app.output = response;
	}
)
