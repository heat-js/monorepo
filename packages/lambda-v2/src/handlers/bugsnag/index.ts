
import Bugsnag from '@bugsnag/js'
import inFlight from '@bugsnag/in-flight'

import { IApp } from '../../app'
import { Next } from '../../compose'
import { test } from '../../helper'
import { ViewableError } from '../../errors/viewable'

export const bugsnag = () => {
	let client;

	return async (app:IApp, next:Next) => {
		app.$.log = () => {
			return async (error, extraData:object = {}) => {
				if(test()) {
					return next();
				}

				if(!client) {
					const apiKey = process.env.BUGSNAG_API_KEY;

					if(!apiKey) {
						throw new Error('Bugsnag API key not found');
					}

					client = Bugsnag.createClient({
						apiKey,
						autoTrackSessions: false,
						logger: null,
					})

					inFlight.trackInFlight(client);
				}

				console.error(error);

				client.notify(error, (event) => {
					event.addMetadata('errorData', error.metadata);
					event.addMetadata('extraData', extraData);
					event.addMetadata('input', app.input);
					event.addMetadata('lambda', {
						requestId: 			app.context.awsRequestId,
						functionName: 		app.context.functionName,
						functionVersion:	app.context.functionVersion,
						memoryLimitInMB:	app.context.memoryLimitInMB,
					});
				});

				await inFlight.flush(3000);
			}
		}

		return timeout(app, wrapper(app, next))();
	}
}

const wrapper = (app, next) => {
	return async () => {
		try {
			await next();
		} catch (error) {
			if(!(error instanceof ViewableError)) {
				await app.log(error);
			}

			throw error;
		}
	}
}

class TimeoutError extends Error {
	constructor(remainingTime:number) {
		super(`Lambda will timeout in ${remainingTime}ms`);
	}
}

const timeout = (app, next) => {
	return async () => {
		if(test()) {
			return next();
		}

		const delay = app.context.getRemainingTimeInMillis() - 1000;
		const id = setTimeout(() => {
			const remaining = app.context.getRemainingTimeInMillis();
			app.log(new TimeoutError(remaining));
		}, delay);

		try {
			await next();
		} finally {
			clearTimeout(id);
		}
	}
}
