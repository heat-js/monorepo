
import { mockFn } from '../helpers/mock'

interface Publish {
	topic: string
	id?: string | number
	event: string
	value?: any
	qos?: 0 | 1 | 2
}

interface IotMock {
	publish: (options: Publish) => void
}

export const createIotMock = ():IotMock => {
	return {
		publish: mockFn(() => {})
	}
}
