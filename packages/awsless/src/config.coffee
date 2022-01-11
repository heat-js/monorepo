
import cf						from './variable-resolver/cf'
import env						from './variable-resolver/env'
import opt						from './variable-resolver/opt'
import Var						from './variable-resolver/var'
import ssm						from './variable-resolver/ssm'
import attr						from './variable-resolver/attr'
import When						from './variable-resolver/when'

import output					from './resource/output'
import website					from './resource/website'
import appsyncApi				from './resource/appsync/api'
import snsTopic					from './resource/sns/topic'
import sqsQueue					from './resource/sqs/queue'
import s3Bucket					from './resource/s3/bucket'
import s3Object					from './resource/s3/object'
import schedule					from './resource/schedule'
import dynamoDBTable			from './resource/dynamodb/table'
import lambdaFunction			from './resource/lambda/function'
import lambdaPolicy				from './resource/lambda/policy'
import lambdaLayer				from './resource/lambda/layer'
import lambdaEventInvokeConfig	from './resource/lambda/event-invoke-config'
import cloudFrontFunction		from './resource/cloud-front/function'
import cloudFormationStack		from './resource/cloud-formation/stack'

export localResolvers = {
	env
	opt
	var: Var
	attr
}

export remoteResolvers = {
	ssm
	cf
}

export logicalResolvers = {
	when: When
}

export resources = {
	'Awsless::Output':						output
	'Awsless::Website':						website
	'Awsless::Schedule':					schedule
	'Awsless::Appsync::Api':				appsyncApi
	'Awsless::SNS::Topic':					snsTopic
	'Awsless::SQS::Queue':					sqsQueue
	'Awsless::S3::Bucket':					s3Bucket
	'Awsless::S3::Object':					s3Object
	'Awsless::DynamoDB::Table':				dynamoDBTable
	'Awsless::Lambda::Function':			lambdaFunction
	'Awsless::Lambda::Policy':				lambdaPolicy
	'Awsless::Lambda::Layer':				lambdaLayer
	'Awsless::Lambda::AsyncConfig':			lambdaEventInvokeConfig
	'Awsless::CloudFront::Function':		cloudFrontFunction
	'Awsless::CloudFormation::Stack':		cloudFormationStack
}
