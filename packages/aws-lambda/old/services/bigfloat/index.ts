
export { BigFloat, Numeric } from './bigfloat.js'

export { neg, abs, add, sub, mul, div, sqrt, pow, ceil, floor } from './arithmetic.js'
export { eq, lt, lte, gt, gte } from './relational.js'

export {
	set_precision, evaluate,

	// arithmetic
	// neg, abs, add, sub, mul, div, sqrt, exponentiation, ceil, floor,

	// constructors
	scientific, fraction,

	// predicates
	is_big_float, is_number, is_negative, is_positive, is_zero, is_integer,

	// relational
	// eq, lt, lte, gt, gte

} from 'bigfloat-esnext'
