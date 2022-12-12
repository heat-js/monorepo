
export { BigFloat, Numeric } from './bigfloat'

export { neg, abs, add, sub, mul, div, sqrt, exponentiation, ceil, floor } from './arithmetic'
export { eq, lt, lte, gt, gte } from './relational'

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
