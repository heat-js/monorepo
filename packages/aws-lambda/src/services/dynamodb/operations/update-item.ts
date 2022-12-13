
import { Table } from '../table.js'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key } from '../types.js'
import { extendMutateCommand, MutateOptions } from '../helper/mutate.js'
import { addExpression } from '../helper/expression.js'

export interface UpdateOptions extends MutateOptions {
	update: Expression
}

export const updateItem = async <T extends Item>(table:Table, key: Key, options:UpdateOptions): Promise<T | undefined> => {
	const command = new UpdateCommand({
		TableName: table.name,
		Key: key,
		UpdateExpression: options.update.expression,
	})

	addExpression(command.input, options.update)
	extendMutateCommand(command, options)

	const result = await table.db.send(command)
	return result.Attributes as T | undefined
}
