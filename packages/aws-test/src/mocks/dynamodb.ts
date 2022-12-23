
import { BatchWriteItemCommand, CreateTableCommand, DeleteItemCommand, DynamoDBClient, GetItemCommand, ListTablesCommand, PutItemCommand, QueryCommand, ScanCommand, TransactGetItemsCommand, TransactWriteItemsCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommand, DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, TransactGetCommand, TransactWriteCommand, UpdateCommand, QueryCommand as Query, ScanCommand as Scan} from '@aws-sdk/lib-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import { startDynamoDB, StartDynamoDBOptions } from '../services/dynamodb'

export const mockDynamoDB = (config:StartDynamoDBOptions) => {
	const dynamo = startDynamoDB(config)
	const client = dynamo.getClient()
	const documentClient = dynamo.getDocumentClient()

	const clientSend = (command:any) => {
		// @ts-ignore
		return client.__proto__.send.wrappedMethod.call(client, command)
	}

	const documentClientSend = (command:any) => {
		// @ts-ignore
		return documentClient.__proto__.send.wrappedMethod.call(documentClient, command)
	}

	mockClient(DynamoDBClient)
		.on(CreateTableCommand).callsFake((input) => clientSend(new CreateTableCommand(input)))
		.on(ListTablesCommand).callsFake((input) => clientSend(new ListTablesCommand(input)))
		.on(GetItemCommand).callsFake((input) => clientSend(new GetItemCommand(input)))
		.on(PutItemCommand).callsFake((input) => clientSend(new PutItemCommand(input)))
		.on(DeleteItemCommand).callsFake((input) => clientSend(new DeleteItemCommand(input)))
		.on(UpdateItemCommand).callsFake((input) => clientSend(new UpdateItemCommand(input)))
		.on(QueryCommand).callsFake((input) => clientSend(new QueryCommand(input)))
		.on(ScanCommand).callsFake((input) => clientSend(new ScanCommand(input)))
		.on(BatchWriteItemCommand).callsFake((input) => clientSend(new BatchWriteItemCommand(input)))
		.on(TransactGetItemsCommand).callsFake((input) => clientSend(new TransactGetItemsCommand(input)))
		.on(TransactWriteItemsCommand).callsFake((input) => clientSend(new TransactWriteItemsCommand(input)))

	mockClient(DynamoDBDocumentClient)
		.on(GetCommand).callsFake((input) => documentClientSend(new GetCommand(input)))
		.on(PutCommand).callsFake((input) => documentClientSend(new PutCommand(input)))
		.on(DeleteCommand).callsFake((input) => documentClientSend(new DeleteCommand(input)))
		.on(UpdateCommand).callsFake((input) => documentClientSend(new UpdateCommand(input)))
		.on(Query).callsFake((input) => documentClientSend(new Query(input)))
		.on(Scan).callsFake((input) => documentClientSend(new Scan(input)))
		.on(BatchWriteCommand).callsFake((input) => documentClientSend(new BatchWriteCommand(input)))
		.on(TransactGetCommand).callsFake((input) => documentClientSend(new TransactGetCommand(input)))
		.on(TransactWriteCommand).callsFake((input) => documentClientSend(new TransactWriteCommand(input)))

	return dynamo
}
