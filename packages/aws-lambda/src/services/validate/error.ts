import { Failure } from 'superstruct'
import { ViewableError } from '../../errors/viewable'

export class ValidationError extends ViewableError {
	constructor(failures:Failure[]) {
		super('validation', 'Validation Error', {
			failures: failures.map(failure => ({
				key: failure.key,
				path: failure.path,
				type: failure.type,
				message: failure.message,
			}))
		})
	}
}
