
import { IApp } from '../../app'
import { Next } from '../../compose'
import { create, Struct } from 'superstruct'

export const validate = (struct?: Struct) => {
	return (app: IApp, next: Next) => {
		app.$.validate = () => {
			return (input, struct) => {
				return create(input, struct);
			}
		}

		if(struct) {
			app.input = app.validate(app.input, struct);
		}

		return next();
	}
}
