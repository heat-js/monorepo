
import { Struct, StructError, mask } from 'superstruct'
import { ValidationError } from './error.js'

const isStructError = (error: unknown): error is StructError => {
	return error instanceof StructError
}

export const validate = <T, S>(value: unknown, struct: Struct<T, S>): T => {
	try {
		return mask(value, struct)
	} catch(error) {
		if(isStructError(error)) {
			throw new ValidationError(error.failures())
		}

		throw error
	}
}
