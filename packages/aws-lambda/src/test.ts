// import { PipeFn } from "pipe-and-compose-types";

// import { IApp } from "./app";

// const app = <T extends IApp>(app) => {
// 	return app
// }

// interface Factory<T> {
// 	(): T
// }

// const object = {
// 	$: {}
// };

// object.$.test = () => {
// 	return 'string'
// }

// namespace IApp {
// 	export let lambda:
// }

// declare function flow {

// }

// interface A {
// 	a: number
// }

// interface B {
// 	b: number
// }

const middlewareA = <T>(context: T) => {
	return {
		...context,
		a: 1
	}
}

const middlewareB = <T>(context: T) => {
	return {
		...context,
		b: 1
	}
}

// declare const pipe: PipeFn;

// const compose:PipeFn = function (stack) {
// 	let context = {};
// 	for(const middleware of stack) {
// 		context = middleware(context);
// 	}
// 	return context;
// }

const m1 = middlewareA({})
const m2 = middlewareB(m1)
const m3 = middlewareB(middlewareA({}))

// const m4 = pipe(
// 	(object) => {
// 		return { ...object, a: 1 };
// 	},
// 	(object) => {
// 		return { ...object, b: 1 };
// 	}
// );

// m4({});

type compose = <A>(a: A) => A

// type compose = <A>(a:A) => A
// type compose = <A, B>(a:A, ab:(a: A) => B) => B

// type compose <A, B, C>
// 	(a:A): A
// 	(a:A, ab:(a: A) => B): B
// 	(a:A, ab:(a: A) => B, bc:(b: B) => C): C
// }

// interface Middleware {
// 	(context)
// }

const compose = function (a: object, b?, c?) {
	switch (arguments.length) {
		case 1:
			return a
		case 2:
			return b(a)
		case 3:
			return c(b(a))
		// default:
		// 	break;
	}
	// for(const middleware in stack) {
	// 	context = <T>stack(context);
	// }
	// return context;
}

const m5 = compose({ n: 1 }, object => {
	return {
		...object,
		b: 1
	}
})
