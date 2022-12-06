
import { mockFn, mockObjectKeys } from '../helpers/mock'
import { serviceName } from '../helpers/service'

type Topics = {
	[key: string]: (payload:unknown) => unknown
}

interface Publish {
	service?: string
	topic: string
	subject?: string
	payload?: any
	attributes?: { [key: string]: string }
}

interface SnsMock<T> {
	$: T
	publish: (options:Publish) => void
}

export const createSnsMock = <T extends Topics>(topics:T):SnsMock<T> => {
	const list = mockObjectKeys(topics)

	return {
		$: Object.freeze(list),
		publish: mockFn(async ({ service, topic, payload }:Publish) => {
			const key = serviceName(service, topic)
			const callback = list[ key ]

			if(!callback) {
				throw new TypeError(`Sns mock function not defined for: ${ key }`)
			}

			await callback(payload)
		})
	}
}
