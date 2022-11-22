
import { make, IBigFloat, string } from 'bigfloat-esnext'

export type Numeric = IBigFloat | number | bigint | string

export class BigFloat implements IBigFloat {
	readonly exponent: number
	readonly coefficient: bigint

	constructor(number: Numeric) {
		const { exponent, coefficient } = make(number)

		this.exponent = exponent
		this.coefficient = coefficient
	}

	toString(radix?:Numeric) {
		if(typeof radix !== 'undefined') {
			radix = make(radix)
		}

		return string(this, radix)
	}
}
