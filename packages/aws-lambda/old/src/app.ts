
import { Context } from 'aws-lambda'
import { IHandle } from './handle'

interface IInstances {
	[key: string | symbol]: any
}

interface IFactories {
	[key: string | symbol]: () => any
}

interface IFactory<T> {
	(): T
}

export interface IApp {
	[key: string | symbol]: any

	input: any
	context: Context
	handle: IHandle

	output?: any

	$: IFactories
	has:(key: string | symbol) => boolean
}

export const createApp = (input:any, context:Context, handle:IHandle): IApp => {
	const instances:IInstances = new Map()
	const factories = new Map()
	const $:IFactories = new Proxy({}, {
		set(_, key, value) {
			if(typeof value !== 'function') {
				throw new TypeError(`App.$."${ key.toString() }" only allows factory functions to be assigned.`)
			}

			factories.set(key, value)
			return true
		}
	})

	const app = {
		input,
		context,
		handle,
		$,

		has (key: string | symbol) {
			return typeof app[key] !== 'undefined' || instances.has(key)
		}
	}

	return new Proxy(app, {
		set(_, key, value) {
			if(typeof value !== 'undefined') {
				instances.set(key, value)
			} else {
				instances.delete(key)
			}

			return true
		},
		deleteProperty(_, key) {
			instances.delete(key)
			return true
		},
		get(_, key) {
			const singleton = instances.get(key)

			if(typeof singleton !== 'undefined') {
				return singleton
			}

			if(key in app) {
				return app[key]
			}

			const factory:IFactory<any> = factories.get(key)

			if(typeof factory !== 'function') {
				throw new TypeError(`App."${ key.toString() }" factory function not found.`)
			}

			const value = factory()
			instances.set(key, value)

			return value
		}
	})
}
