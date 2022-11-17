
import resource		from '../../../feature/resource'
import { GetAtt }	from '../../../feature/cloudformation/fn'

export default resource (ctx) ->

	stack	= ctx.string [ '#Stack',	'@Config.Stack' ]
	region	= ctx.string [ '#Region',	'@Config.Region' ]
	profile	= ctx.string [ '#Profile',	'@Config.Profile' ]
	postfix = ctx.string 'Postfix'

	ctx.addResource "#{ ctx.name }Scheduler#{ postfix }", {
		Type: 'AWS::Scheduler::Schedule'
		Region: region
		Properties: {
			State: 'ENABLED'
			ScheduleExpression: ctx.string 'Rate'
			GroupName: stack
			# ScheduleExpressionTimezone: ctx.string 'Timezone', 'UTC'
			# StartDate:	ctx.string 'StartDate'
			# EndDate:	ctx.string 'EndDate'
			Targets: {
				Arn:		GetAtt ctx.name, 'Arn'
				Input:		JSON.stringify ctx.any 'Input', {}
				RoleArn:	GetAtt "#{ ctx.name }SchedulerRole#{ postfix }", 'Arn'
			}
		}
	}

	ctx.addResource "#{ ctx.name }LambdaSchedulerRole#{ postfix }", {
		Type: 'AWS::IAM::Role'
		Region: region
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17'
				Statement: [
					{
						Action: ['sts:AssumeRole']
						Effect: 'Allow'
						Principal: {
							Service: ['scheduler.amazonaws.com']
						}
					}
				]
			}
			Policies: [
				{
					PolicyName: "#{ ctx.name }LambdaSchedulerPolicy#{ postfix }"
					PolicyDocument: {
						Statement: [
							{
								Action: 'lambda:InvokeFunction'
								Effect: 'Allow'
								Resource: {
									GetAtt ctx.name, 'Arn'
								}
							}
						]
					}
				}
			]
		}
	}
