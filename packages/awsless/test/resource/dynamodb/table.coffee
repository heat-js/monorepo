
import Context	from '../../../src/context'
import table	from '../../../src/resource/dynamodb/table'

describe 'Resource DynamoDB Table', ->

	it 'test', ->
		context = new Context { name: 'Test' }
		table context, 'TestTable', {
			Name: 'test-table'
			BillingMode: 'PROVISIONED'
			Schema:
				HASH: S: 'hash'
				SORT: N: 'sort'

			WCU: 3
			RCU: 3

			Indexes: [{
				Name: 'index-name'
				Schema:
					HASH: S: 'name'
				Scaling:
					Write:
						Max: 10
						Min: 1

					Read:
						Max: 10
						Min: 1
			}]

			Scaling:
				Write:
					Max: 10
					Min: 1

				Read:
					Max: 10
					Min: 1
		}

		resources = context.getResources()
		expect Object.keys resources
			.toStrictEqual [
				'TestTableWriteScalableTarget'
				'TestTableWriteScalingPolicy'
				'TestTableReadScalableTarget'
				'TestTableReadScalingPolicy'
				'TestTableIndex0WriteScalableTarget'
				'TestTableIndex0WriteScalingPolicy'
				'TestTableIndex0ReadScalableTarget'
				'TestTableIndex0ReadScalingPolicy'
				'TestTableScalingRole'
				'TestTable'
			]
