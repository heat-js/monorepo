
import { coerce, define, number, string, union, assert, refine, Struct } from 'superstruct'
import { Big } from 'big.js'

export const big = ():Struct<Big, null> => {
	const base = define<Big>('big', (value) => {
		try {
			Big(value)
			return true
		} catch(error) {
			return 'Invalid big number'
		}
	})

	return coerce(base, union([ string(), number(), base]), (value): Big => {
		assert(value, base)
		return Big(value)
	})
}

export const positive = <T extends Big, S extends any>(struct:Struct<T, S>) => {
	const expected = `Expected a positive ${struct.type}`

	return refine(struct, 'positive', (value:Big) => {
		return value.gt(0) || `${expected} but received '${value}'`
	})
}

export const percision = <T extends Big, S extends any>(struct:Struct<T, S>, decimals:number) => {
	const expected = `Expected a ${struct.type}`

	return refine(struct, 'percision', (value:Big) => {
		return value.toFixed() === value.round(decimals, Big.roundDown).toFixed() || `${expected} with ${decimals} decimals`
	})
}
