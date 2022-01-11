
import Client from '../client/cloudformation'

export default ({ profile, region, templateBody, templateUrl }) ->

	cloudFormation = await Client { profile, region }
	params = if templateUrl then { TemplateURL: templateUrl } else { TemplateBody: templateBody }
	result = await cloudFormation.validateTemplate params
		.promise()

	return result.Capabilities
