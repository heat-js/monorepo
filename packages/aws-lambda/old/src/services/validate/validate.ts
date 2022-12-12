
import { Struct, create, StructError } from 'superstruct'
import { ValidationError } from './error'

export const validate = <T, S>(value: unknown, struct: Struct<T, S>): T => {
	try {
		return create(value, struct)
	} catch(error) {
		if(error instanceof StructError) {
			throw new ValidationError(error.failures().map(failure => ({
				key: failure.key,
				path: failure.path,
				type: failure.type,
				message: failure.message,
			})))
		}

		throw error
	}
}
