
import { UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, MutateOptions, ReturnKeyType, ReturnModelType } from '../types.js'
import { extendMutateCommand } from '../helper/mutate.js'
import { addExpression } from '../helper/expression.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'

export interface UpdateOptions extends MutateOptions {
	update: Expression
}

export const updateItem = async <I extends Item, T extends Table | string = string>(
	table: T,
	key: ReturnKeyType<T>,
	options:UpdateOptions
): Promise<ReturnModelType<I, T> | undefined> => {
	const command = new UpdateCommand({
		TableName: table.toString(),
		Key: key,
		UpdateExpression: options.update.expression,
	})

	addExpression(command.input, options.update)
	extendMutateCommand(command, options)

	const result = await send(command, options) as UpdateCommandOutput

	return result.Attributes as ReturnModelType<I, T> | undefined
}
