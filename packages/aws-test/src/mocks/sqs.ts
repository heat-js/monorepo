
import { mockFn, mockObjectKeys } from '../helpers/mock'
import { serviceName } from '../helpers/service'

type Queues = {
	[key: string]: (payload:unknown) => unknown
}

interface Send {
	service?: string
	name: string
	payload?: any
	delay?: number
}

interface SqsMock<T> {
	$: T
	send: (options:Send) => void
}

export const createSqsMock = <T extends Queues>(queues:T):SqsMock<T> => {
	const list = mockObjectKeys(queues)

	return {
		$: Object.freeze(list),
		send: mockFn(async ({ service, name, payload }:Send) => {
			const key = serviceName(service, name)
			const callback = list[ key ]

			if(!callback) {
				throw new TypeError(`Sqs mock function not defined for: ${ key }`)
			}

			await callback(payload)
		})
	}
}
