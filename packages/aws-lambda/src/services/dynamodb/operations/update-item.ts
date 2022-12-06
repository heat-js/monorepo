
import { Table } from '../table'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Expression, Item, Key } from '../types'
import { extendMutateCommand, MutateOptions } from '../helper/mutate'
import { addExpression } from '../helper/expression'

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
