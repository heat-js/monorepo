
import { Struct } from 'superstruct'
import { IApp } from '../../request'
import { Next } from '../../src/compose'
import { ViewableError } from '../../src/errors/viewable'
import { Request } from './request'

interface JsonOptions {
	parse?: (value:string) => any
}

export const json = (struct:Struct<any, unknown>, options:JsonOptions = {}) => {
	const {
		parse = JSON.parse.bind(JSON),
	} = options

	return async (app: IApp, next: Next) => {

		const request = app.request as Request

		let json

		try {
			json = parse(request.body)
		} catch (error) {
			throw new ViewableError('invalid-json-body', 'Invalid Json Body')
		}

		const input = {
			...request.params,
			...json
		}

		if(struct) {
			app.json = app.validate(input, struct)
		} else {
			app.json = input
		}

		await next()
	}
}
