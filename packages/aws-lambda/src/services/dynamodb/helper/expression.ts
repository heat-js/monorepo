
import { Expression } from '../types'

export const addExpression = (command, expression:Expression) => {
	const names = { ...(command.ExpressionAttributeNames || {}), ...expression.names }
	const values = { ...(command.ExpressionAttributeValues || {}), ...expression.values }

	if(Object.keys(names).length) {
		command.ExpressionAttributeNames = names
	}

	if(Object.keys(values).length) {
		command.ExpressionAttributeValues = values
	}
}
