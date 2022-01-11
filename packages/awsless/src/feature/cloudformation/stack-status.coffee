
import Client from '../client/cloudformation'

export default ({ profile, region, stack }) ->
	cloudFormation = Client { profile, region }

	try
		result = await cloudFormation.describeStacks { StackName: stack }
			.promise()
	catch error
		if error.code is 'ValidationError' and error.message.includes 'does not exist'
			return false

		throw error

	return result.Stacks[0]?.StackStatus
