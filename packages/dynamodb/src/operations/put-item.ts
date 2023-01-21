
import { PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Item, MutateOptions, ReturnModelType } from '../types.js'
import { extendMutateCommand } from '../helper/mutate.js'
import { send } from '../helper/send.js'
import { Table } from '../table.js'

export interface PutOptions extends MutateOptions {}

export const putItem = async <I extends Item, T extends Table | string = string>(
	table: T,
	item: ReturnModelType<I, T>,
	options:PutOptions = {}
): Promise<ReturnModelType<I, T> | undefined> => {
	const command = new PutCommand({
		TableName: table.toString(),
		Item: item,
	})

	extendMutateCommand(command, options)

	const result = await send(command, options) as PutCommandOutput

	return result.Attributes as ReturnModelType<I, T> | undefined
}
