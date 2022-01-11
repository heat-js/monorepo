
import resource 	from '../../feature/resource'
import loadFiles 	from '../../feature/appsync/load-files'
import { join }		from 'path'
import { run }		from '../../feature/terminal/task'
import time			from '../../feature/performance/time'
import { Ref, GetAtt, Split, Select, isArn, isFn, Sub }	from '../../feature/cloudformation/fn'
import { parseDomain, ParseResultType }	from 'parse-domain'
import output		from '../output'

# getDataSourceType = (item) ->
# 	return (
# 		if item.lambda then { key: item.lambda, type: 'lambda' }
# 		else { key: 'none', type: 'none' }
# 	)

toLambdaArn = (arn) ->
	if not isFn(arn) and not isArn(arn)
		return Sub "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:#{ arn }"

	return arn

userPoolConfig = (ctx) ->
	config = ctx.object 'UserPoolConfig', {}
	if not Object.keys(config).length
		return {}

	return {
		UserPoolConfig: {
			AwsRegion:		ctx.string [ 'UserPoolConfig.AwsRegion', 'UserPoolConfig.Region', '@Config.Region' ]
			UserPoolId:		ctx.string 'UserPoolConfig.UserPoolId'
			DefaultAction:	ctx.string 'UserPoolConfig.DefaultAction', 'ALLOW'
		}
	}

resolver = (ctx, item) ->
	dataSourceName = "#{ ctx.name }DataSource#{ item.dataSource.key }"
	if item.dataSource.type is 'none'
		dataSourceName = "#{ ctx.name }DataSourceNone"

	ctx.addResource "#{ ctx.name }Resolver#{ item.id }", {
		Type:		'AWS::AppSync::Resolver'
		Region:		ctx.string '#Region', ''
		DependsOn:	"#{ ctx.name }Schema"
		Properties: {
			ApiId:						GetAtt ctx.name, 'ApiId'
			Kind:						'UNIT'
			TypeName:					item.type
			FieldName:					item.field
			RequestMappingTemplate:		item.request
			ResponseMappingTemplate:	item.response
			DataSourceName:				GetAtt dataSourceName, 'Name'
		}
	}

dataSourceNone = (ctx) ->
	ctx.addResource "#{ ctx.name }DataSourceNone", {
		Type:		'AWS::AppSync::DataSource'
		Region:		ctx.string '#Region', ''
		DependsOn:	"#{ ctx.name }Schema"
		Properties: {
			ApiId:	GetAtt ctx.name, 'ApiId'
			Name:	'None'
			Type:	'NONE'
		}
	}

dataSourceLambda = (ctx, item) ->
	ctx.addResource "#{ ctx.name }DataSource#{ item.dataSource.key }", {
		Type:		'AWS::AppSync::DataSource'
		Region:		ctx.string '#Region', ''
		DependsOn:	"#{ ctx.name }Schema"
		Properties: {
			ApiId:	GetAtt ctx.name, 'ApiId'
			Name:	item.id
			Type:	'AWS_LAMBDA'
			ServiceRoleArn:			GetAtt "#{ ctx.name }ServiceRole", 'Arn'
			LambdaConfig:
				LambdaFunctionArn:	toLambdaArn item.dataSource.value
		}
	}

dataSource = (ctx, item, cache) ->
	if cache.includes item.dataSource.key
		return

	cache.push item.dataSource.key
	switch item.dataSource.type
		when 'lambda' then dataSourceLambda ctx, item
		else dataSourceNone ctx

lambdaPolicy = (resolvers) ->
	return {
		Effect: 'Allow'
		Action: 'lambda:invokeFunction'
		Resource: resolvers
			.filter ({ dataSource }) -> dataSource.type is 'lambda'
			.map ({ dataSource }) ->
				return toLambdaArn dataSource.value
	}

role = (ctx, resolvers) ->
	ctx.addResource "#{ ctx.name }ServiceRole", {
		Type:		'AWS::IAM::Role'
		Region:		ctx.string '#Region', ''
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17'
				Statement: [{
					Effect: 'Allow'
					Action: 'sts:AssumeRole'
					Principal: {
						Service: 'appsync.amazonaws.com'
					}
				}]
			}

			Policies: [{
				PolicyName: "#{ ctx.name }-Service-Role"
				PolicyDocument: {
					Version: '2012-10-17'
					Statement: [
						lambdaPolicy resolvers
					]
				}
			}]
		}
	}

formatHostedZoneName = (domain) ->
	result = parseDomain domain

	if result.type isnt ParseResultType.Listed
		throw new TypeError "Invalid Appsync::Api DomainName: #{ domain }"

	return "#{ result.domain }.#{ result.topLevelDomains.join '.' }."

export default resource (ctx) ->

	name				= ctx.string 'Name'
	region				= ctx.string '#Region', ''
	Stack 				= ctx.string '@Config.Stack'
	DomainName			= ctx.string 'DomainName', ''
	HostedZoneId		= ctx.string 'HostedZoneId', 'Z2FDTNDATAQYW2'
	Aliases				= ctx.array 'Aliases', []
	AcmCertificateArn	= ctx.string 'Certificate', ''

	sourceFiles	= ctx.string [ 'Path', 'Src', 'Source', 'SourceFiles' ]
	sourceFiles	= join process.cwd(), sourceFiles

	mappingTemplates = ctx.string 'MappingTemplates', ''
	if mappingTemplates
		mappingTemplates = join process.cwd(), mappingTemplates

	ctx.addResource ctx.name, {
		Type:	'AWS::AppSync::GraphQLApi'
		Region:	region
		Properties: {
			Name:					name
			AuthenticationType:		ctx.string 'AuthenticationType'
			XrayEnabled:			ctx.boolean [ 'Xray', 'XrayEnabled' ], false

			...userPoolConfig ctx

			Tags: [
				...ctx.array 'Tags', []
				{ Key: 'AppsyncName', Value: name }
			]
		}
	}

	# -------------------------------------------------------
	# Make the route53 record set

	if DomainName
		ctx.addResource "#{ ctx.name }Route53Record", {
			Type: 'AWS::Route53::RecordSet'
			Properties: {
				HostedZoneName: formatHostedZoneName DomainName
				Name: "#{ DomainName }."
				Type: 'A'
				AliasTarget: {
					DNSName: GetAtt "#{ ctx.name }CloudFrontDistribution", 'DomainName'
					HostedZoneId
				}
			}
		}

		for _, index in Aliases
			alias = ctx.string "Aliases.#{ index }"
			ctx.addResource "#{ ctx.name }Alias#{ index }Route53Record", {
				Type: 'AWS::Route53::RecordSet'
				Properties: {
					HostedZoneName: formatHostedZoneName alias
					Name: "#{ alias }."
					Type: 'A'
					AliasTarget: {
						DNSName: GetAtt "#{ ctx.name }CloudFrontDistribution", 'DomainName'
						HostedZoneId
					}
				}
			}

	# -------------------------------------------------------
	# Make the cloudfront distribution

	if DomainName
		ctx.addResource "#{ ctx.name }CloudFrontDistribution", {
			Type: 'AWS::CloudFront::Distribution'
			Properties: {
				DistributionConfig: {
					Enabled: true
					DefaultRootObject: '/'
					Aliases: [ DomainName, ...Aliases ]
					PriceClass: 'PriceClass_All'
					HttpVersion: 'http2'
					ViewerCertificate: {
						SslSupportMethod: 'sni-only'
						AcmCertificateArn
					}
					Origins: [ {
						Id: 'AppSyncOrigin'
						DomainName: Select 2, Split '/', GetAtt ctx.name, 'GraphQLUrl'
						CustomOriginConfig: {
							HTTPPort: 80
							HTTPSPort: 443
							OriginKeepaliveTimeout: 5
							OriginReadTimeout: 30
							OriginProtocolPolicy: 'https-only'
							OriginSSLProtocols: [ 'TLSv1', 'TLSv1.1', 'TLSv1.2' ]
						}
					} ]
					DefaultCacheBehavior: {
						TargetOriginId: 'AppSyncOrigin'
						ViewerProtocolPolicy: 'redirect-to-https'
						AllowedMethods: [ 'GET', 'HEAD', 'OPTIONS', 'DELETE', 'POST', 'PUT', 'PATCH' ]
						Compress: true
						ForwardedValues: {
							Headers: [
								'Origin'
								'User-Agent'
								'Access-Control-Request-Headers'
								'Access-Control-Request-Method'
								'CloudFront-Viewer-Country'
								'CloudFront-Viewer-City'
							]
							QueryString: false
							Cookies: {
								Forward: 'none'
							}
						}
					}
				}
			}
		}

		# -------------------------------------------------------
		# Make outputs

		output ctx, "#{ ctx.name }DomainName", {
			Name:			"#{ Stack }-#{ ctx.name }-DomainName"
			Value:			DomainName
			Description:	"The Domain Name of the #{ ctx.name }"
		}

		output ctx, "#{ ctx.name }DistributionDomainName", {
			Name:			"#{ Stack }-#{ ctx.name }-Distribution-DomainName"
			Value:			GetAtt "#{ ctx.name }CloudFrontDistribution", 'DomainName'
			Description:	'The Domain Name of the CloudFrontDistribution'
		}

		output ctx, "#{ ctx.name }DistributionId", {
			Name:			"#{ Stack }-#{ ctx.name }-DistributionId"
			Value:			Ref "#{ ctx.name }CloudFrontDistribution"
			Description:	"The CloudFront Distribution ID of the #{ ctx.name }"
		}

	# -------------------------------------------------------
	# Parse AppSync schema & resolvers

	ctx.on 'prepare-resource', ->
		{ schema, resolvers } = await run (task) ->
			task.setPrefix 'AppSync API'
			task.setName name
			task.setContent 'Parsing graphql...'

			elapsed = time()

			result = await loadFiles sourceFiles, mappingTemplates

			task.setContent 'Parsed'
			task.addMetadata 'Resolvers', result.resolvers.length
			task.addMetadata 'Time', elapsed()
			return result

		ctx.addResource "#{ ctx.name }Schema", {
			Type:	'AWS::AppSync::GraphQLSchema'
			Region:	region
			Properties: {
				ApiId:			GetAtt ctx.name, 'ApiId'
				Definition:		schema
			}
		}

		cache = []
		role ctx, resolvers
		for item in resolvers
			resolver ctx, item
			dataSource ctx, item, cache



# batchResolvers = chunk resolvers
# 		for resolvers, index in batchResolvers
# 			cloudFormationStack(
# 				ctx
# 				"#{ ctx.name }Stack"
# 				{
# 					Description: "#{ ctx.name } resolvers stack #{ index }"
# 					Resources: {
# 						...resolver ctx, item
# 						...dataSource ctx, item
# 					}
# 				}
# 				{
# 					Region:	region
# 					DependsOn: [
# 						- "#{ ctx.name }Schema"
# 						- "#{ ctx.name }ServiceRole"
# 					]
# 				}
# 			)

# 			ctx.addResource "#{ ctx.name }Stack", {
# 				Type:	'AWS::AppSync::GraphQLSchema'
# 				Region:	region
# 				Properties: {
# 					ApiId:			GetAtt ctx.name, 'ApiId'
# 					Definition:		schema
# 				}
# 			}
