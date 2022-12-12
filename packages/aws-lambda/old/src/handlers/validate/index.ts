
import { IApp } from '../../app'
import { Next } from '../../compose'
import { Struct } from 'superstruct'
import { validate as create } from '../../services/validate'

export const validate = <T, S>(struct?: Struct<T, S>) => {
	return (app: IApp, next: Next) => {
		app.$.validate = () => {
			return <A, B>(input:unknown, struct: Struct<A, B>): A => {
				return create(input, struct)
			}
		}

		if(struct) {
			app.input = app.validate(app.input, struct) as T
		}

		return next()
	}
}
