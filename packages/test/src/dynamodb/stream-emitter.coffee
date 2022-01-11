
import AWS from 'aws-sdk'

export default class StreamEmitter

	constructor: (@listeners = {}, @definitions) ->

	setDefinitions: (@definitions) ->

	attach: (client) ->
		batchWrite		= client.batchWrite.bind client
		transactWrite	= client.transactWrite.bind client
		update			= client.update.bind client
		put				= client.put.bind client
		deleteFn		= client.delete.bind client

		client.batchWrite		= (params) => return @batchWrite client, batchWrite, params
		client.transactWrite	= (params) => return @transactWrite client, transactWrite, params
		client.update			= (params) => return @update client, update, params
		client.put 				= (params) => return @put client, put, params
		client.delete 			= (params) => return @delete client, deleteFn, params

	hasListeners: (table) ->
		listeners = @listeners[ table ]

		return (
			( Array.isArray listeners ) or
			( typeof listeners is 'function' )
		)

	emit: (table, eventName, Key, OldImage, NewImage) ->
		if not @hasListeners table
			return

		Key			= Key and AWS.DynamoDB.Converter.marshall Key
		OldImage	= OldImage and AWS.DynamoDB.Converter.marshall OldImage
		NewImage	= NewImage and AWS.DynamoDB.Converter.marshall NewImage

		listeners = @listeners[ table ]
		if not Array.isArray listeners
			listeners = [ listeners ]

		return Promise.all listeners.map (listener) ->
			return listener {
				Records: [
					{
						eventName
						dynamodb: { Keys: Key, OldImage, NewImage }
					}
				]
			}

	getItem: (client, TableName, Key) ->
		result = await client.get { Key, TableName }
			.promise()

		return result.Item

	getPrimaryKey: (table, item) ->
		properties = @definitions.find (def) ->
			return def.TableName is table

		if not properties
			throw new Error 'Could not find key schema for table: ' + table

		key = {}
		for schema in properties.KeySchema
			key[schema.AttributeName] = item[schema.AttributeName]

		return key

	update: (client, update, params) ->
		request = update params

		{ Key, TableName } = params

		if not @hasListeners TableName
			return request

		return {
			promise: =>
				OldImage	= await @getItem client, TableName, Key
				result		= await request.promise()
				NewImage	= await @getItem client, TableName, Key

				await @emit TableName, 'MODIFY', Key, OldImage, NewImage

				return result
		}

	put: (client, put, params) ->
		request = put params

		{ TableName, Item } = params

		if not @hasListeners TableName
			return request

		Key	= @getPrimaryKey TableName, Item

		return {
			promise: =>
				OldImage	= await @getItem client, TableName, Key
				result		= await request.promise()
				NewImage	= await @getItem client, TableName, Key

				await @emit TableName, 'INSERT', Key, OldImage, NewImage

				return result
		}

	delete: (client, deleteFn, params) ->
		request = deleteFn params

		{ TableName, Key } = params

		if not @hasListeners TableName
			return request

		return {
			promise: =>
				OldImage	= await @getItem client, TableName, Key
				result		= await request.promise()
				NewImage	= await @getItem client, TableName, Key

				await @emit TableName, 'REMOVE', Key, OldImage, NewImage

				return result
		}

	filterTransactItems: (items) ->
		return items
			.map (item) =>
				if item.Put
					return {
						eventName: 'INSERT'
						table:		item.Put.TableName
						key:		@getPrimaryKey item.Put.TableName, item.Put.Item
					}

				if item.Delete
					return {
						eventName: 'REMOVE'
						table:		item.Delete.TableName
						key:		item.Delete.Key
					}

				if item.ConditionCheck
					return {
						table:	item.ConditionCheck.TableName
						key:	item.ConditionCheck.Key
					}

				return {
					eventName: 'MODIFY'
					table:		item.Update.TableName
					key:		item.Update.Key
				}

			.filter (item) =>
				return @hasListeners item.table


	transactWrite: (client, transactWrite, params) ->
		request = transactWrite params
		return {
			promise: =>
				items = @filterTransactItems params.TransactItems

				oldData = await Promise.all items.map ({ table, key }) =>
					return @getItem client, table, key

				result = await request.promise()

				newData = await Promise.all items.map ({ table, key }) =>
					return @getItem client, table, key

				await Promise.all [ 0...items.length ].map (index) =>
					eventName	= items[index].eventName
					table		= items[index].table
					key			= items[index].key
					oldImage	= oldData[index]
					newImage	= newData[index]

					if eventName
						return @emit table, eventName, key, oldImage, newImage

				return result
		}

	filterRequestItems: (items) ->
		return Object
			.entries items
			.map ([ table, entries ]) =>
				return entries.map (entry) =>
					if entry.PutRequest
						return {
							table
							eventName: 'INSERT'
							key:		@getPrimaryKey table, entry.PutRequest.Item
						}

					if entry.DeleteRequest
						return {
							table
							eventName: 'REMOVE'
							key:		entry.DeleteRequest.Key
						}
			.flat()
			.filter (item) =>
				return @hasListeners item.table

	batchWrite: (client, batchWrite, params) ->
		request = batchWrite params
		return {
			promise: =>
				items = @filterRequestItems params.RequestItems

				oldData = await Promise.all items.map ({ table, key }) =>
					return @getItem client, table, key

				result = await request.promise()

				newData = await Promise.all items.map ({ table, key }) =>
					return @getItem client, table, key

				await Promise.all [ 0...items.length ].map (index) =>
					eventName	= items[index].eventName
					table		= items[index].table
					key			= items[index].key
					oldImage	= oldData[index]
					newImage	= newData[index]

					if eventName
						return @emit table, eventName, key, oldImage, newImage

				return result
		}
