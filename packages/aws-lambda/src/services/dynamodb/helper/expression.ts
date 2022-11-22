
import { Expression } from '../types'

export const addExpression = (command, expression:Expression) => {
	command.input.ExpressionAttributeNames = {
		...command.input.ExpressionAttributeNames,
		...expression.names
	}

	command.input.ExpressionAttributeValues = {
		...command.input.ExpressionAttributeValues,
		...expression.values
	}
}
