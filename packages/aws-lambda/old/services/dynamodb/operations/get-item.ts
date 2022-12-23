
import { Table } from '../table.js'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { Item, Key } from '../types.js'

export interface GetOptions {
	consistentRead?: boolean
}

export const getItem = async <T extends Item>(table: Table, key: Key, { consistentRead = false }:GetOptions = {}): Promise<T | undefined> => {
	const command = new GetCommand({
		TableName: table.name,
		Key: key,
		ConsistentRead: consistentRead
	})

	const result = await table.db.send(command)

	return result.Item as T | undefined
}
