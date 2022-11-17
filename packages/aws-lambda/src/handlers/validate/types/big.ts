
import { coerce, define, number, string, union, assert, refine } from 'superstruct'
import { Big } from 'big.js'

export const big = () => {
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

export const positive = (struct) => {
	const expected = `Expected a positive ${struct.type}`

	return refine(struct, 'positive', (value:Big) => {
		if (!(value instanceof Big)) {
			return `${expected} but received "${value}"`
		}

		return value.gt(0) || `${expected} but received \`${value}\``
	})
}

// export const percision = (struct, decimals:number) => {
// 	const expected = `Expected a ${struct.type}`;

// 	return refine(struct, 'percision', (value:Big) => {
// 		if (!(value instanceof Big)) {
// 			return `${expected} but received "${value}"`;
// 		}

// 		return value.gt(0) || `${expected} but received \`${value}\``
// 	})
// }


// function size<X extends string>(): {[key:string]:X} {
// 	return {
// 		lol: '1'
// 	}
// }
