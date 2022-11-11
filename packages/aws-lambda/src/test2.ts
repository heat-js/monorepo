type Next = () => void | Promise<void>
type Middleware<T> = (context: T, next: Next) => Promise<void> | void

/**
 * A middleware container and invoker
 */
class MwDispatcher<T> {
	middlewares: Middleware<T>[]

	constructor() {
		this.middlewares = []
	}

	/**
	 * Add a middleware function.
	 */
	use(...mw: Middleware<T>[]): void {
		this.middlewares.push(...mw)
	}

	/**
	 * Execute the chain of middlewares, in the order they were added on a
	 * given Context.
	 */
	dispatch(context: T): Promise<void> {
		return invokeMiddlewares(context, this.middlewares)
	}
}

/**
 * Helper function for invoking a chain of middlewares on a context.
 */
async function invokeMiddlewares<T>(
	context: T,
	middlewares: Middleware<T>[]
): Promise<void> {
	if (!middlewares.length) return

	const mw = middlewares[0]

	return mw(context, async () => {
		await invokeMiddlewares(context, middlewares.slice(1))
	})
}

// -------------

// type MyContext = {
// 	a: number;
//   }

type MyContext = {
	a: 1
}

const app = new MwDispatcher<MyContext>()

/**
 * A middleware
 */
app.use(<T>(context: T, next: Next) => {
	context.a += 1
	return next()
})

/**
 * An async middleware
 */
app.use(async <T>(context: T, next: Next) => {
	// wait 2 seconds
	await new Promise(res => setTimeout(res, 2000))
	context.a += 2
	return next()
})

// const middleware1 = <T>(context: T) => {
// 	return {
// 		...context,
// 		a: 1
// 	}
// }

// const middleware2 = <T>(context: T) => {
// 	return {
// 		...context,
// 		b: 1
// 	}
// }

// const mw1 = middleware1({})
// const mw2 = middleware2(mw1)
// const mw3 = middleware2(middleware1({}))
