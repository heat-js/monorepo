
import { isAttr, resolve } from '../../attribute'
import Reference from '../../reference'

export default (template, globals) ->
	return JSON.stringify template, (key, value) ->
		if key is 'Region'
			return

		if key is 'Fn::GetAtt' and typeof value is 'string'
			parts = value.split '.'
			return [
				parts.shift()
				parts.join '.'
			]

		if typeof value is 'object'
			if isAttr value
				return resolve value, globals

			if value instanceof Reference
				return value.toJSON()

		return value
