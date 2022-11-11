import { randomUUID } from "crypto"
import { IApp } from "../../app"
import { Next } from "../../compose"
import { event } from "../event"
import { Lambda, lambda } from "../lambda"

interface Config {
	flag?: string
	log?: boolean
	concurrency?: number
}

export const warmer = ({ flag = 'warmer', log = true, concurrency = 1 }:Config = {}) => {

	return [
		lambda(),
		event('before-warmer'),
		async (app:IApp, next:Next) => {
			const input = app.input;

			if (typeof input === 'object' && input[flag]) {
				const event = {
					action:				'warmer',
					functionName:		process.env.AWS_LAMBDA_FUNCTION_NAME,
					functionVersion:	process.env.AWS_LAMBDA_FUNCTION_VERSION,
				};

				if(input.__WARMER_CORRELATIONID__) {
					if(log) {
						console.log({
							...event,
							invocationId:	input.__WARMER_INVOCATION__,
							correlationId:	input.__WARMER_CORRELATIONID__,
						})
					}
				} else {
					const correlationId = app.context.awsRequestId || randomUUID();
					const times	= input.concurrency || concurrency || 1;

					if(log) {
						console.log({
							...event,
							invocationId: 1,
							correlationId,
						})
					}

					await Promise.all(Array.from({ length: times - 1 }).map((_, index) => {
						return ( app.lambda as Lambda ).invoke({
							name: process.env.AWS_LAMBDA_FUNCTION_NAME,
							// type: 'Event',
							payload: {
								[flag]: true,
								__WARMER_INVOCATION__: index + 2,
								__WARMER_CORRELATIONID__: correlationId
							}
						})
					}));
				}

				app.output = 'warmed';
				return;
			}

			return next();
		}
	]
}
