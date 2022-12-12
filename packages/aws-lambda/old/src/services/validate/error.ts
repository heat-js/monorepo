import { ViewableError } from '../../errors/viewable'

export class ValidationError extends ViewableError {
	constructor(failures) {
		super('validation', 'Validation Error', {
			failures
		})
	}
}
