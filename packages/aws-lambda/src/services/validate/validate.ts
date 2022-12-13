
import { Struct, StructError, mask } from 'superstruct'
import { ValidationError } from './error.js'

export const validate = <T, S>(value: unknown, struct: Struct<T, S>): T => {
	try {
		return mask(value, struct)
	} catch(error) {
		if(error instanceof StructError) {
			throw new ValidationError(error.failures())
		}

		throw error
	}
}
