
import { IApp } from '../../app'
import { Next } from '../../compose'
import { create, Struct } from 'superstruct'

export const validate = (struct?: Struct<any, unknown>) => {
	return (app: IApp, next: Next) => {
		app.$.validate = () => {
			return (input, struct: Struct) => {
				return create(input, struct)
			}
		}

		if(struct) {
			app.input = app.validate(app.input, struct)
		}

		return next()
	}
}