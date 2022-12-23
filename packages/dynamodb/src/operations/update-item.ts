
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key, MutateOptions } from '../types.js'
import { extendMutateCommand } from '../helper/mutate.js'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'

export interface UpdateOptions extends MutateOptions {
	update: Expression
}

export const updateItem = async <T extends Item>(table:string, key: Key, options:UpdateOptions): Promise<T | undefined> => {
	const command = new UpdateCommand({
		TableName: table,
		Key: key,
		UpdateExpression: options.update.expression,
	})

	addExpression(command.input, options.update)
	extendMutateCommand(command, options)

	const result = await send(command, options) as UpdateCommandOutput

	return result.Attributes as T | undefined
}
