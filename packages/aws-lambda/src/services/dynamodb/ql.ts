
import { Expression, Value } from './types.js'

let index = 0

const id = () => {
	index = (index + 1) % 100
	return index
}

export const ql = (literals:TemplateStringsArray, ...raw:Value[]): Expression => {
	const names:{[key:string]: string} = {}
	const values:{[key:string]: unknown} = {}
	const string:string[] = []

	literals.forEach((literal, i) => {
		string.push(literal)

		if(i in raw) {
			const key = `:v${id()}`
			const value = raw[i]
			string.push(key)
			values[key] = value
		}
	})

	const expression = string
		.join('')
		.replace(/[\r\n]/gm, '')
		.replace(/\#([a-z0-9]+)/ig, (key, name) => {
			names[key] = name
			return key
		})

	return {
		expression,
		names,
		values
	}
}
