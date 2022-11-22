import { DeleteCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Expression } from '../types'
import { addExpression } from './expression'

export interface MutateOptions {
	condition?: Expression
	return?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'
}

export const extendMutateCommand = (command: PutCommand | DeleteCommand | UpdateCommand, options:MutateOptions) => {
	if(options.return) {
		command.input.ReturnValues = options.return
	}

	if(options.condition) {
		command.input.ConditionExpression = options.condition.expression
		addExpression(command, options.condition)
	}
}
