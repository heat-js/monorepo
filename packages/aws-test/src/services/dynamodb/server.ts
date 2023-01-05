
import dynamoDbLocal from 'dynamo-db-local'
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { parseUrl } from '@aws-sdk/url-parser'
import { Endpoint } from '@aws-sdk/types'
import sleep from 'await-sleep'

export class Server {
	private client: DynamoDBClient
	private documentClient: DynamoDBDocumentClient
	private endpoint: Endpoint

	private process

	constructor(private region = 'us-east-1') {
		this.endpoint = parseUrl(`http://localhost`)
	}

	async listen(port:number) {
		this.endpoint.port = port
		this.process = await dynamoDbLocal.spawn({ port })
	}

	/** Kill the DynamoDB server. */
	async kill() {
		if(this.process) {
			await this.process.kill()
			this.process = undefined
		}
	}

	/** Ping the DynamoDB server if its ready. */
	async ping() {
		const client = this.getClient()
		const command = new ListTablesCommand({})
		const response = await client.send(command)
		return Array.isArray(response.TableNames)
	}

	/** Ping the DynamoDB server untill its ready. */
	async wait(times:number = 10) {
		while(times--) {
			try {
				if(await this.ping()) {
					return
				}
			} catch (error) {
				await sleep(100 * times)
				continue
			}
		}

		throw new Error('DynamoDB server is unavailable')
	}

	/** Get DynamoDBClient connected to dynamodb local. */
	getClient() {
		if(!this.client) {
			this.client = new DynamoDBClient({
				maxAttempts: 10,
				endpoint: this.endpoint,
				region: this.region,
				tls: false,
				credentials: {
					accessKeyId: 'fake',
					secretAccessKey: 'fake',
				}
			})
		}

		return this.client
	}

	/** Get DynamoDBDocumentClient connected to dynamodb local. */
	getDocumentClient() {
		if(!this.documentClient) {
			this.documentClient = DynamoDBDocumentClient.from(this.getClient(), {
				marshallOptions: {
					removeUndefinedValues: true
				}
			})
		}

		return this.documentClient
	}
}
