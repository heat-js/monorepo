
import { mockFn, mockObjectKeys } from '../helpers/mock'
import { serviceName } from '../helpers/service'

type Lambdas = {
	[key: string]: (payload:unknown) => unknown
}

interface Invoke {
	service?: string
	type?: 'RequestResponse' | 'Event' | 'DryRun'
	name: string
	payload?: any
	reflectViewableErrors?: boolean
}

interface LambdaMock<T> {
	$: T
	invoke: (options:Invoke) => any
}

export const createLambdaMock = <T extends Lambdas>(lambdas:T):LambdaMock<T> => {
	const list = mockObjectKeys(lambdas)

	return {
		$: Object.freeze(list),
		invoke: mockFn(async ({ service, name, payload, type = 'RequestResponse' }:Invoke) => {
			const key = serviceName(service, name)
			const callback = list[ key ]

			if(!callback) {
				throw new TypeError(`Lambda mock function not defined for: ${ key }`)
			}

			const result = await callback(payload)

			if(type === 'RequestResponse') {
				return result
			}
		})
	}
}
