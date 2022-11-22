
import { coerce, define, number, string, union, assert, refine, Struct, StructError } from 'superstruct'
import { BigFloat, gt } from '../../bigfloat'

export const bigfloat = ():Struct<BigFloat, null> => {
	const base = define<BigFloat>('bigfloat', (value) => {
		return (value instanceof BigFloat) || 'Invalid number'
	})

	return coerce(base, union([ string(), number(), base]), (value): BigFloat => {

		if(value instanceof BigFloat) {
			return value
		}

		if(typeof value === 'string' || typeof value === 'number') {
			if(!isNaN(Number(value))) {
				return new BigFloat(value)
			}
		}

		throw new Error('Invalid number')
	})
}

export const positive = <T extends BigFloat, S extends any>(struct:Struct<T, S>) => {
	const expected = `Expected a positive ${struct.type}`
	const zero = new BigFloat(0)

	return refine(struct, 'positive', (value:BigFloat) => {
		return gt(value, zero) || `${expected} but received '${value}'`
	})
}

export const percision = <T extends BigFloat, S extends any>(struct:Struct<T, S>, decimals:number) => {
	const expected = `Expected a ${struct.type}`

	return refine(struct, 'percision', (value:BigFloat) => {
		return -value.exponent <= decimals || `${expected} with ${decimals} decimals`
	})
}
