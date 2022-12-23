
import { PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb'
import { Item, MutateOptions } from '../types.js'
import { extendMutateCommand } from '../helper/mutate.js'
import { send } from '../helper/send.js'

export interface PutOptions extends MutateOptions {}

export const putItem = async <T extends Item>(table: string, item: T, options:PutOptions = {}): Promise<T | undefined> => {
	const command = new PutCommand({
		TableName: table,
		Item: item,
	})

	extendMutateCommand(command, options)

	const result = await send(command, options) as PutCommandOutput

	return result.Attributes as T | undefined
}
