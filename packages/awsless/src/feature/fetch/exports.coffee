
import cache			from '../utils/function-cache'
import CloudFormation	from '../client/cloudformation'

export default cache ({ profile, region }) ->
	cloudFormation = CloudFormation {
		profile
		region
	}

	list	= {}
	params	= {}

	while true
		result = await cloudFormation.listExports params
			.promise()

		for item in result.Exports
			list[ item.Name ] = item.Value

		if result.NextToken
			params.NextToken = result.NextToken
		else
			break

	return list
