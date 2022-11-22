
import {
	make, mul as a_mul, div as a_div, neg as a_neg, sub as a_sub, add as a_add,
	abs as a_abs, sqrt as a_sqrt, ceil as a_ceil, floor as a_floor, exponentiation as a_exponentiation
} from 'bigfloat-esnext'

import { BigFloat, Numeric } from './bigfloat'

export const neg = (a:Numeric) => new BigFloat(a_neg(make(a)))
export const abs = (a:Numeric) => new BigFloat(a_abs(make(a)))
export const add = (a:Numeric, ...other:Numeric[]) => {
	return new BigFloat(other.reduce((prev, current) => {
		return a_add(make(prev), make(current))
	}, a))
}

export const sub = (a:Numeric, ...other:Numeric[]) => {
	return new BigFloat(other.reduce((prev, current) => {
		return a_sub(make(prev), make(current))
	}, a))
}

export const mul = (multiplicand:Numeric, multiplier:Numeric) => {
	return new BigFloat(a_mul(make(multiplicand), make(multiplier)))
}

export const div = (dividend:Numeric, divisor:Numeric, precision?:number) => {
	return new BigFloat(a_div(make(dividend), make(divisor), precision))
}

export const sqrt = (a:Numeric) => new BigFloat(a_sqrt(make(a)))
export const ceil = (a:Numeric) => new BigFloat(a_ceil(make(a)))
export const floor = (a:Numeric) => new BigFloat(a_floor(make(a)))

export const exponentiation = (base:Numeric, exp:Numeric) => {
	return new BigFloat(a_exponentiation(make(base), make(exp)))
}
