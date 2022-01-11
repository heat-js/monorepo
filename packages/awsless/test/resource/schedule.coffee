
import Context	from '../../src/context'
import schedule	from '../../src/resource/schedule'
import { Ref }	from '../../src/feature/cloudformation/fn'

describe 'Resource DynamoDB Table', ->

	it 'test', ->
		context = new Context { name: 'Test' }
		schedule context, 'Schedule', {
			Definition: [
				{
					Type: 'Invoke'
					Name: Ref 'lambda1'
				}
				{
					Type: 'Wait'
					Time: 10
				}
				{
					Type: 'Invoke'
					Name: 'lambda2'
				}
			]
		}

		resources = context.getResources()

		expect resources.Schedule.Properties.Definition
			.toStrictEqual {
				StartAt: 'State1'
				States: {
					State1: { Type: 'Task', Resource: { Ref: 'lambda1' }, Next: 'State2' }
					State2: { Type: 'Wait', Seconds: 10, Next: 'State3' }
					State3: { Type: 'Task', Resource: 'lambda2', End: true }
				}
			}

		expect resources.ScheduleRole.Properties.Policies[0].PolicyDocument.Statement[0].Resource
			.toStrictEqual [
				{ Ref: 'lambda1' }
				'lambda2'
			]
