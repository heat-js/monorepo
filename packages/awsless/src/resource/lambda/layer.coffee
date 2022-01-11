
import resource			from '../../feature/resource'
import uploadLayer		from '../../feature/lambda/layer-upload'

export default resource (ctx) ->

	stack		= ctx.string [ '#Stack',	'@Config.Stack' ]
	region		= ctx.string [ '#Region',	'@Config.Region' ]
	profile		= ctx.string [ '#Profile',	'@Config.Profile' ]

	bucket		= ctx.string [ 'DeploymentBucket', '@Config.Lambda.DeploymentBucket', '@Config.DeploymentBucket' ]
	name		= ctx.string [ 'Name', 'LayerName' ]
	description	= ctx.string 'Description', ''
	runtimes	= ctx.array [ 'Runtimes', 'CompatibleRuntimes' ], []
	zip			= ctx.string 'Zip'

	ctx.on 'prepare-resource', ->
		{ key, version } = await uploadLayer {
			stack
			profile
			region
			bucket
			name
			zip
		}

		ctx.addResource ctx.name, {
			Type: 'AWS::Lambda::LayerVersion'
			Region: region
			Properties: {
				LayerName:			name
				Description:		description
				CompatibleRuntimes:	runtimes
				Content: {
					S3Bucket:			bucket
					S3Key:				key
					S3ObjectVersion:	version
				}
			}
		}
