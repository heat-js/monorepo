
find = (list) ->
	regions = []
	for name, item of list
		regions.push item.Region

	return regions

filter = (list, defaultRegion, filterRegion) ->
	filtered = {}
	for name, item of list
		region = (
			item.Region or
			( item.Properties and item.Properties.Region ) or
			defaultRegion
		)

		# console.log name, region

		if region is filterRegion
			filtered[ name ] = item

	return filtered

export default (context) ->
	stack			= context.string '@Config.Stack',				'stack'
	defaultRegion	= context.string '@Config.Region',				'us-east-1'
	profile			= context.string '@Config.Profile',				'default'
	bucket			= context.string '@Config.DeploymentBucket',	''
	description		= context.string '@Config.Description',			''

	outputs			= context.getOutputs()
	resources		= context.getResources()

	regions = [
		...find outputs
		...find resources
	].filter (i) -> i

	regions	= [ ...new Set [ ...regions, defaultRegion ] ]

	# console.log regions

	stacks = regions.map (region) ->
		return {
			name: stack
			stack
			bucket
			region
			profile
			templateBody: {
				AWSTemplateFormatVersion: '2010-09-09'
				Description:	description
				Resources:		filter resources, defaultRegion, region
				Outputs:		filter outputs, defaultRegion, region
			}
		}

	for entry in context.getDefinedStacks()
		stacks.push {
			name:		entry.name		or stack
			stack:		entry.name		or stack
			bucket
			region:		entry.region	or defaultRegion
			profile:	entry.profile	or profile
			templateBody: {
				AWSTemplateFormatVersion: '2010-09-09'
				Description:	entry.description or ''
				Resources:		entry.resources
				Outputs:		entry.outputs or []
			}
		}

	return stacks
