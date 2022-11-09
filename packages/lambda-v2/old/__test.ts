
// import { App } from "./app";
import { handle } from "./handle";
import { event } from "./handlers/event";
// import { lambda, LambdaApp } from "./handlers/lambda";
// import { Invoker } from "./handlers/lambda/lambda";


const fn = handle(
	// lambda(),
	event('before'),

	async (app) => {
		const { test } = app.input;

		// app.

		// const response = await (app.lambda as Invoker).invoke({
		// 	service: 'lol',
		// 	name: 'lol',
		// 	payload: {
		// 		test
		// 	}
		// });
	}
)

fn.on('before', (app) => {
	app.lambda = {
		invoke: () => { },
		invokeAsync: () => { }
	};
})

fn({ test: 'hello' });




// // interface IApp {
// // 	input: string
// // }

// interface ILambda {
// 	lambda: number
// }


// // const app:IApp = {
// // 	input: 'hallo'
// // }

// interface Factories {
// 	[key: string | symbol]: () => any;
// }

// class App {
// 	$: Factories
// }

// class LambdaApp {
// 	lambda:number
// }

// // const lambda:ILambda = {
// // 	lambda: 1
// // }

// const lambda = (app:App) => {
// 	// app.lambda = 1;

// 	// return app.extend({
// 	// 	lambda: 1
// 	// })

// 	// const newApp:{ lambda: 1, $lambda:() => number }|App = {
// 	// 	...app,
// 	// 	$lambda: () => 1
// 	// };

// 	// return newApp;

// 	app.$ = {
// 		...app.$,
// 		lambda: (): Invoker => {

// 		}
// 	}

// 	// return {
// 	// 	...app,
// 	// 	$lambda: 1
// 	// }:{lambda:Invoker};
// }

// const app = new App<App, LambdaApp>();
// app.
// // combine.


// app.rules = object({

// })
