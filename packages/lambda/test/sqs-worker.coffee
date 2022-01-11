
import handle 		from '../src/handle'
import SqsWorker 	from '../src/middleware/sqs-worker'

lambda = handle(
	new SqsWorker
	(app) -> throw new Error
)

describe 'Test SQS Worker Middleware', ->
	it 'should throw an error', ->
		await expect lambda()
			.rejects.toThrow Error
