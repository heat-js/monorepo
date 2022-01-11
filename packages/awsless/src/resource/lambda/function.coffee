
import resource				from '../../feature/resource'
import uploadLambda			from '../../feature/lambda/upload'
import { Ref, GetAtt, Sub }	from '../../feature/cloudformation/fn'
import removeDirectory		from '../../feature/fs/remove-directory'
import objectPath 			from '../../feature/object-path'
import createChecksum 		from '../../feature/crypto/checksum'
import path					from 'path'
import cron					from './event/cron'
import sns					from './event/sns'
import sqs					from './event/sqs'
import dynamodb				from './event/dynamodb'
import elb					from './event/elb'
import iot					from './event/iot'
import eventInvokeConfig	from './event-invoke-config'
import output				from '../output'
import addPolicy, { addManagedPolicy, policyChecksum } from './policy'

reservedConcurrentExecutions = (ctx) ->
	reserved = ctx.number [
		'Reserved'
		'ReservedConcurrentExecutions'
		'@Config.Lambda.Reserved'
		'@Config.Lambda.ReservedConcurrentExecutions'
	], 0

	if reserved <= 0
		return {}

	return { ReservedConcurrentExecutions: reserved }

vpcConfig = (ctx) ->
	vpc = ctx.object [
		'Vpc'
		'VPC'
		'VpcConfig'
		'@Config.Lambda.Vpc'
		'@Config.Lambda.VPC'
		'@Config.Lambda.VpcConfig'
	], {}

	if not Object.keys(vpc).length
		return {}

	# addManagedPolicy ctx, 'AWSLambdaVPCAccessExecutionRole'

	addPolicy ctx, 'lambda-vpc', [
		{
			Effect: 'Allow'
			Action: [
				'ec2:CreateNetworkInterface'
				'ec2:DescribeNetworkInterfaces'
				'ec2:DeleteNetworkInterface'
				'ec2:AssignPrivateIpAddresses'
				'ec2:UnassignPrivateIpAddresses'
			]
			Resource: '*'
		}
	]

	return {
		VpcConfig: {
			SecurityGroupIds: objectPath {
				properties: vpc
				type: 'array'
				paths: [ 'SecurityGroups', 'SecurityGroupIds' ]
			}
			SubnetIds: objectPath {
				properties: vpc
				type: 'array'
				paths: [ 'Subnets', 'SubnetIds' ]
			}
		}
	}

environmentVariables = (ctx) ->
	if ctx.boolean [ 'RemoveEnv', '@Config.Lambda.RemoveEnv' ], false
		return {}

	defaultVars = {
		AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
		AWS_ACCOUNT_ID:	Ref 'AWS::AccountId'
	}

	BUGSNAG_API_KEY = ctx.string [ 'Bugsnag.ApiKey', '@Config.Bugsnag.ApiKey' ], ''
	if BUGSNAG_API_KEY
		defaultVars = { ...defaultVars, BUGSNAG_API_KEY }

	return {
		Environment: {
			Variables: {
				...defaultVars
				...ctx.object [ '@Config.Lambda.Env', '@Config.Lambda.ENV' ], {}
				...ctx.object [ 'Env', 'ENV' ], {}
			}
		}
	}

export default resource (ctx) ->

	stack		= ctx.string [ '#Stack',	'@Config.Stack' ]
	region		= ctx.string [ '#Region',	'@Config.Region' ]
	profile		= ctx.string [ '#Profile',	'@Config.Profile' ]

	bucket			= ctx.string [ 'DeploymentBucket', '@Config.Lambda.DeploymentBucket', '@Config.DeploymentBucket' ]
	prefixName		= ctx.string '@Config.PrefixResourceName', ''
	name			= ctx.string [ 'Name', 'FunctionName' ]
	name			= "#{ prefixName }#{ name }"
	handle			= ctx.string 'Handle'
	role			= ctx.string [ 'Role', '@Config.Lambda.Role' ], ''
	layers			= ctx.array [ 'Layers', '@Config.Lambda.Layers' ], []
	logging			= ctx.boolean [ 'Logging', '@Config.Lambda.Logging' ], false
	warmer			= ctx.boolean [ 'Warmer', '@Config.Lambda.Warmer' ], false
	events			= ctx.array 'Events', []
	externals		= ctx.array [ 'Externals', '@Config.Lambda.Externals' ], []
	files			= ctx.object [ 'Files',	'@Config.Lambda.Files' ], {}
	asyncConfig		= ctx.object [ 'Async', '@Config.Lambda.Async' ], {}
	bugsnagApiKey	= ctx.string [ 'Bugsnag.ApiKey', '@Config.Bugsnag.ApiKey' ], ''
	webpackConfig	= ctx.object [ 'WebpackConfig', '@Config.Lambda.WebpackConfig' ], {}

	# versionedArnExportName		= ctx.object [ 'Async', '@Config.Lambda.Async' ], {}

	# force a policy resource to be made
	addPolicy ctx

	if logging
		ctx.addResource "#{ ctx.name }LogGroup", {
			Type: 'AWS::Logs::LogGroup'
			Region: region
			Properties: {
				LogGroupName:		"/aws/lambda/#{ name }"
				RetentionInDays:	ctx.number [ 'LogRetentionInDays', '@Config.Lambda.LogRetentionInDays' ], 14
			}
		}

		logsARN = "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/#{ name }"
		addPolicy ctx, 'lambda-logging', [
			{
				Effect: 'Allow'
				Action: [ 'logs:CreateLogStream', 'logs:CreateLogGroup' ]
				Resource: Sub "#{ logsARN }:*"
			}
			{
				Effect: 'Allow'
				Action: 'logs:PutLogEvents'
				Resource: Sub "#{ logsARN }:*:*"
			}
		]

	if warmer
		cron ctx, ctx.name, {
			Postfix:	'Warmer'
			Rate:		'rate(5 minutes)'
			Input:		{ warmer: true, concurrency: 3 }
		}, { Region: region }

		addPolicy ctx, 'lambda-warmer', {
			Effect:		'Allow'
			Action:		'lambda:InvokeFunction'
			Resource:	Sub "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:#{ name }:$LATEST"
		}

	for event, index in events
		event	= { ...event, Postfix: String index }
		type	= ctx.string "Events.#{ index }.Type"

		switch type.toLowerCase()
			when 'cron'		then cron ctx, ctx.name, event
			when 'sns'		then sns ctx, ctx.name, event
			when 'sqs'		then sqs ctx, ctx.name, event
			when 'dynamodb'	then dynamodb ctx, ctx.name, event
			when 'elb'		then elb ctx, ctx.name, event
			when 'iot'		then iot ctx, ctx.name, event
			else throw TypeError "Unknown lambda event type: \"#{type}\""

	if Object.keys(asyncConfig).length
		eventInvokeConfig(
			ctx
			"#{ ctx.name }AsyncConfig"
			{
				...asyncConfig
				Name: Ref ctx.name
			}
			{ Region: region }
		)

	ctx.once 'cleanup', ->
		dir = path.join process.cwd(), '.awsless', 'lambda'
		await removeDirectory dir

	# ctx.on 'after-deploying-stack', ->
	# 	bugsnagApiKey = ctx.string [ 'Bugsnag.ApiKey', '@Config.Bugsnag.ApiKey' ]
	# 	if bugsnagApiKey and ctx.getAttribute ctx.name, 'Changed'
	# 		await uploadSourceMap {
	# 			apiKey: bugsnagApiKey
	# 			name
	# 		}

	ctx.on 'prepare-resource', ->
		{ key, checksum, hash, version, changed } = await uploadLambda {
			stack
			profile
			region
			bucket
			handle
			name
			externals
			files
			webpackConfig
			bugsnagApiKey
			policyChecksum: policyChecksum ctx
		}

		# checksum = createChecksum checksum, policyChecksum ctx

		ctx.addResource "#{ ctx.name }Version#{ checksum }", {
			Type: 'AWS::Lambda::Version'
			Region: region
			DeletionPolicy: 'Retain'
			Properties: {
				FunctionName:	Ref ctx.name
				CodeSha256:		hash
			}
		}

		ctx.setAttribute ctx.name, 'Changed',		changed
		ctx.setAttribute ctx.name, 'Version',		GetAtt "#{ ctx.name }Version#{ checksum }", 'Version'
		ctx.setAttribute ctx.name, 'VersionedArn',	Ref "#{ ctx.name }Version#{ checksum }"

		ctx.addResource ctx.name, {
			Type: 'AWS::Lambda::Function'
			Region: region
			Properties: {
				Code: {
					S3Bucket:			bucket
					S3Key:				key
					S3ObjectVersion:	version
				}
				FunctionName:	name
				Handler:		"#{ name }#{ path.extname handle }"
				Role:			role or GetAtt 'LambdaPolicyIamRole', 'Arn'
				MemorySize:		ctx.number [ 'MemorySize', '@Config.Lambda.MemorySize' ], 128
				Runtime:		ctx.string [ 'Runtime', '@Config.Lambda.Runtime' ], 'nodejs12.x'
				Architectures:	[ ctx.string [ 'Architecture', '@Config.Lambda.Architecture' ], 'arm64' ]
				Timeout:		ctx.number [ 'Timeout', '@Config.Lambda.Timeout' ], 30
				Layers:			layers

				...reservedConcurrentExecutions ctx
				...vpcConfig ctx
				...environmentVariables ctx

				Tags: [
					...ctx.array 'Tags', []
					{ Key: 'FunctionName', Value: name }
				]
			}
		}
