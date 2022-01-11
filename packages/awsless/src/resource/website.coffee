
import sync				from '@heat/s3-deploy/sync'
import path				from 'path'
import filesize 		from 'filesize'
import resource 		from '../feature/resource'
import isDirectory		from '../feature/fs/is-directory'
import clearCache		from '../feature/cloud-front/clear-cache'
import emptyBucket		from '../feature/s3/empty-bucket'
# import { keyval }		from '../feature/console'
import { run }			from '../feature/terminal/task'
import fetchExports		from '../feature/fetch/exports'
import time				from '../feature/performance/time'
import output			from './output'

import { parseDomain, ParseResultType }	from 'parse-domain'
import { Ref, Select, Split, GetAtt }	from '../feature/cloudformation/fn'

formatHostedZoneName = (domain) ->
	result = parseDomain domain

	if result.type isnt ParseResultType.Listed
		throw new TypeError "Invalid Website DomainName: #{ domain }"

	return "#{ result.domain }.#{ result.topLevelDomains.join '.' }."

forwardedValues = (ctx) ->
	forwarded = {}

	headers = ctx.array 'Forward.Headers', []
	cookies = ctx.array 'Forward.Cookies', []
	queries = ctx.array 'Forward.QueryStrings', []

	if headers.length
		forwarded.Headers = headers

	if cookies.length
		forwarded.Cookies = {
			Forward: 'whitelist'
			WhitelistedNames: cookies
		}
	else
		forwarded.Cookies = {
			Forward: 'none'
		}

	if queries.length
		forwarded.QueryString = true
		forwarded.QueryStringCacheKeys = queries
	else
		forwarded.QueryString = false

	return {
		ForwardedValues: forwarded
	}

functionAssociations = (ctx) ->
	events = ctx.array 'Events', []
	if not events.length
		return {}

	return {
		FunctionAssociations: events.map (event, index) -> {
			EventType:		ctx.string "Events.#{ index }.Type"
			FunctionARN:	ctx.string [ "Events.#{ index }.Arn", "Events.#{ index }.ARN" ]
		}
	}

lambdaFunctionAssociations = (ctx) ->
	events = ctx.array 'LambdaEvents', []
	if not events.length
		return {}

	return {
		LambdaFunctionAssociations: events.map (event, index) -> {
			EventType:			ctx.string "LambdaEvents.#{ index }.Type"
			IncludeBody:		ctx.boolean "LambdaEvents.#{ index }.IncludeBody", false
			LambdaFunctionARN:	ctx.string [ "LambdaEvents.#{ index }.Arn", "LambdaEvents.#{ index }.ARN" ]
		}
	}

export default resource (ctx) ->

	region				= ctx.string '@Config.Region'
	profile				= ctx.string '@Config.Profile'
	Stack 				= ctx.string '@Config.Stack'
	DomainName			= ctx.string 'DomainName'
	BucketName			= ctx.string [ 'BucketName', 'DomainName' ]
	HostedZoneId		= ctx.string 'HostedZoneId', 'Z2FDTNDATAQYW2'
	Aliases				= ctx.array 'Aliases', []
	AcmCertificateArn	= ctx.string 'Certificate', ''

	# -------------------------------------------------------
	# Make the s3 bucket

	ctx.addResource "#{ ctx.name }S3Bucket", {
		Type: 'AWS::S3::Bucket'
		Properties: {
			BucketName
			AccessControl:			ctx.string 'AccessControl', 'Private'
			WebsiteConfiguration: {
				ErrorDocument:		ctx.string 'ErrorDocument', 'index.html'
				IndexDocument:		ctx.string 'IndexDocument', 'index.html'
			}
		}
	}

	# -------------------------------------------------------
	# Make the route53 record set

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

	ctx.addResource "#{ ctx.name }CloudFrontDistribution", {
		Type: 'AWS::CloudFront::Distribution'
		Properties: {
			DistributionConfig: {
				Enabled: true
				DefaultRootObject: ctx.string 'IndexDocument', 'index.html'
				Aliases: [ DomainName, ...Aliases ]
				PriceClass: 'PriceClass_All'
				HttpVersion: 'http2'
				ViewerCertificate: {
					SslSupportMethod: 'sni-only'
					AcmCertificateArn
				}
				Origins: [ {
					Id: 'S3BucketOrigin'
					DomainName: Select 1, Split '//', GetAtt "#{ ctx.name }S3Bucket", 'WebsiteURL'
					CustomOriginConfig: {
						OriginProtocolPolicy: 'http-only'
					}
				} ]
				DefaultCacheBehavior: {
					TargetOriginId: 'S3BucketOrigin'
					ViewerProtocolPolicy: 'redirect-to-https'
					AllowedMethods: [ 'GET', 'HEAD', 'OPTIONS' ]
					Compress: true

					...forwardedValues ctx
					...functionAssociations ctx
					...lambdaFunctionAssociations ctx
				}
			}
		}
	}

	# -------------------------------------------------------
	# Make outputs

	output ctx, "#{ ctx.name }DomainName", {
		Name:			"#{ Stack }-#{ ctx.name }-DomainName"
		Value:			DomainName
		Description:	'The Domain Name of the Website'
	}

	output ctx, "#{ ctx.name }DistributionDomainName", {
		Name:			"#{ Stack }-#{ ctx.name }-Distribution-DomainName"
		Value:			GetAtt "#{ ctx.name }CloudFrontDistribution", 'DomainName'
		Description:	'The Domain Name of the CloudFrontDistribution'
	}

	output ctx, "#{ ctx.name }DistributionId", {
		Name:			"#{ Stack }-#{ ctx.name }-DistributionId"
		Value:			Ref "#{ ctx.name }CloudFrontDistribution"
		Description:	'The CloudFront Distribution ID of the Website'
	}

	# -------------------------------------------------------
	# Events before stack deploy

	ctx.on 'validate-resource', ->
		folder = ctx.string 'Syncing.Folder', ''
		if not folder
			return

		folder = path.join process.cwd(), folder

		if not await isDirectory folder
			throw new Error "Website folder doesn't exist: #{ folder }"

	# -------------------------------------------------------
	# Events after stack deploy

	ctx.on [ 'after-deploying-stack', 'sync' ], ->

		folder = ctx.string 'Syncing.Folder', ''

		if not folder
			return

		folder = path.join process.cwd(), folder

		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Bucket'
			task.setName BucketName
			task.setContent 'Syncing...'

			await sync {
				profile
				region
				folder
				bucket:					BucketName
				ignoredExtensions:		ctx.array 'Syncing.IgnoreExtensions', []
				acl:					ctx.string 'ACL', 'public-read'
				cacheAge:				ctx.number 'CacheAge', 31536000
				logging: 				false
			}

			if ctx.boolean 'Syncing.ClearCache', true
				values			= await fetchExports { profile, region }
				distributionId	= values[ "#{ Stack }-#{ ctx.name }-DistributionId" ]
				if distributionId
					task.setContent 'Clearing cloudfront cache...'
					await clearCache {
						profile
						region
						distributionId
					}

			task.setContent 'Synced'
			task.addMetadata 'Time', elapsed()

	# -------------------------------------------------------
	# Events before stack delete

	ctx.on 'before-deleting-stack', ->
		await run (task) ->
			elapsed = time()

			task.setPrefix 'S3 Bucket'
			task.setName BucketName
			task.setContent 'Emptying...'

			{ size, count } = await emptyBucket {
				profile
				region
				bucket: BucketName
			}

			task.setContent 'Emptied'
			task.addMetadata 'Files', count
			task.addMetadata 'Size', filesize size
			task.addMetadata 'Time', elapsed()
