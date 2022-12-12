
export { bigfloat, positive, precision } from './types/bigfloat'
export { date } from './types/date'
export { uuid } from './types/uuid'
export { lowercase, uppercase } from './types/string'
export { validate } from './validate'
export { ValidationError } from './error'

export {
	// coercions
	coerce, defaulted, trimmed,

	// refinements
	empty, max, min, nonempty, pattern, size, refine,

	// types
	any, array, bigint, boolean, enums, func, instance, integer, intersection,
	literal, map, never, nullable, number, object, optional, record, regexp,
	set, string, tuple, type, union, unknown,

	// utilities
	assign, define, deprecated, dynamic, lazy, omit, partial, pick, struct,

	// struct
	assert, create, mask, is,
	Struct,
	// Struct, Context, Infer, Describe, Result, Coercer, Validator, Refiner,

	// error
	StructError
	// Failure, StructError
} from 'superstruct'
