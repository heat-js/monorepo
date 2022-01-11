
import resource 	from '../../feature/resource'
import Client		from '../../feature/client/s3'

upload = ({ name, profile, region, stack, bucket, templateBody }) ->
	if not bucket
		throw new Error '''
			You need to set a "Config.DeploymentBucket" to handle Awsless::CloudFormation::Stack resources.
		'''

	s3 = Client { profile, region }

	result = await s3.putObject {
		Bucket: 		bucket
		Key:			"#{ stack }/#{ name }-nested-cloudformation.json"
		ACL:			'private'
		Body:			templateBody
		StorageClass:	'STANDARD'
	}
	.promise()

	return "https://s3-#{ region }.amazonaws.com/#{ bucket }/#{ stack }/#{ name }-nested-cloudformation.json"

timeoutInMinutes = (ctx) ->
	TimeoutInMinutes = ctx.number 'TimeoutInMinutes', ''
	if TimeoutInMinutes is ''
		return {}

	return { TimeoutInMinutes }

parameters = (ctx) ->
	Parameters = ctx.object 'Parameters', {}
	if Object.keys(Parameters).length is 0
		return {}

	return { Parameters }

dependsOn = (ctx) ->
	DependsOn = ctx.array '#DependsOn', []
	if DependsOn.length is 0
		return {}

	return { DependsOn }

export default resource (ctx) ->

	stack		= ctx.string [ '#Stack',			'@Config.Stack' ]
	region		= ctx.string [ '#Region',			'@Config.Region' ]
	profile		= ctx.string [ '#Profile',			'@Config.Profile' ]
	bucket		= ctx.string [ 'DeploymentBucket',	'@Config.CloudFormation.DeploymentBucket', '@Config.DeploymentBucket' ]

	ctx.on 'prepare-resource', ->
		url = await upload {
			name:	ctx.name
			stack
			region
			profile
			bucket
			templateBody: JSON.stringify {
				AWSTemplateFormatVersion: '2010-09-09'
				Description:	ctx.string 'Description', ''
				Resources:		ctx.object 'Resources'
				# Outputs:		ctx.object 'Outputs',
			}
		}

		ctx.addResource ctx.name, {
			Type:		'AWS::CloudFormation::Stack'
			Region:		ctx.string '#Region', ''
			...dependsOn ctx
			Properties: {
				TemplateURL: 	url
				Tags:			ctx.array 'Tags', []

				...timeoutInMinutes ctx
				...parameters ctx
			}
		}
