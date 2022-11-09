
import { IHandle } from "./handle";

interface IFactories {
	[key: string | symbol]: () => any;
}

// interface IApp {

// }

export class App {
	[key: string | symbol]: any;

	input: any;
	output?: any;
	context: object;
	handle: IHandle;

	readonly $:IFactories;
	private instances = new Map;

    constructor (input, context, handle) {
		this.$ = new Proxy({}, {
			set(target, key, value) {
				if(typeof value !== 'function') {
					throw new TypeError(`App.$.${ key.toString() } only allows factory functions to be assigned.`);
				}

				target[key] = value;
				return true;
			}
		});

		const proxy = new Proxy(this, {
			set(app, key, value) {
				app.instances.set(key, value);
				return true;
			},
			get(app, key) {
				const singleton	= app.instances.get(key);

				if(typeof app[key] === 'function') {
					return app[key].bind(app);
				}

				if(typeof singleton !== 'undefined') {
					return singleton;
				}

				const factory = app.$[ key ];

				if(typeof factory !== 'function') {
					throw new TypeError(`App.${ key.toString() } factory function not found.`);
				}

				const value = factory();
				app.instances.set(key, value);

				return value;
			}
		});

		proxy.input = input;
		proxy.context = context;
		proxy.handle = handle;

		handle.app = proxy

        return proxy;
    }

	has (key: string | symbol) {
		return this.instances.has(key);
	}

	invalidate(key: string | symbol) {
		return this.instances.delete(key);
	}
}

// interface App {
// 	[key: string | symbol]: any;
// 	lambda?: any;
// }

// class Lambda {
// 	public invoke({ payload }): any {
// 		return payload
// 	}
// }

// interface IApp {
// 	lambda: Lambda;
// }

// const app = new App(input, context);
// const lambda = new Lambda();

// app.$.lambda = () => lambda;
// app.$.heat = () => lambda;

// app.lambda = lambda

// app.lambda.invoke
