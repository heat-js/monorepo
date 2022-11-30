
type ObjectParam = {
	[key: string]: Function
}

export const mockFn = (fn) => {
	return globalThis.vi.fn(fn)
}

export const mockObjectKeys = <T extends ObjectParam>(object: T): T => {
	const list = {}
	Object.entries(object).forEach(([key, value]) => {
		list[key] = mockFn(value)
	})

	return list as T
}
