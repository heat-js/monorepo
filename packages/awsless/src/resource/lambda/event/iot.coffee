
import resource			from '../../../feature/resource'
import { GetAtt, Sub }	from '../../../feature/cloudformation/fn'

# conditions = (ctx) ->
# 	list = []
# 	path = ctx.string 'Path', ''
# 	if path then list.push {
# 		Field: 'path-pattern'
# 		PathPatternConfig: { Values: [ path ] }
# 	}

# 	method = ctx.string 'Method', ''
# 	if method then list.push {
# 		Field: 'http-request-method'
# 		HttpRequestMethodConfig: { Values: [ method ] }
# 	}

# 	return list

export default resource (ctx) ->

	stack	= ctx.string [ '#Stack', '@Config.Stack' ]
	Region	= ctx.string '#Region', ''
	postfix	= ctx.string 'Postfix'
	sql		= ctx.string [ 'Sql', 'SQL' ]
	name	= ctx.string [ 'Name', 'RuleName' ]

	ctx.addResource "#{ ctx.name }ElbLambdaPermission#{ postfix }", {
		Type: 'AWS::Lambda::Permission'
		Region
		Properties: {
			FunctionName:	GetAtt ctx.name, 'Arn'
			Action:			'lambda:InvokeFunction'
			Principal:		'iot.amazonaws.com'
			SourceArn:		Sub "arn:${AWS::Partition}:iot:${AWS::Region}:${AWS::AccountId}:rule/#{ name }"
		}
	}

	ctx.addResource "#{ ctx.name }IotTopicRule#{ postfix }", {
		Type: 'AWS::IoT::TopicRule'
		Region
		Properties: {
			RuleName: name
			TopicRulePayload: {
				Sql: sql
				RuleDisabled: false
				Actions: [
					{ Lambda: { FunctionArn: GetAtt ctx.name, 'Arn' } }
				]
			}
		}
	}

	# ctx.addResource "#{ ctx.name }ElbTargetGroup#{ postfix }", {
	# 	Type: 'AWS::ElasticLoadBalancingV2::TargetGroup'
	# 	Region
	# 	DependsOn: [
	# 		"#{ ctx.name }ElbLambdaPermission#{ postfix }"
	# 	]
	# 	Properties: {

	# 		# Name: targetGroupName
	# 		# TargetType: 'lambda'
	# 		# Targets: [
	# 		# 	{ Id: GetAtt ctx.name, 'Arn' }
	# 		# ]
	# 	}
	# }



# "ConnectIotTopicRule1": {
# 			"Type": "AWS::IoT::TopicRule",
# 			"Properties": {
# 				"TopicRulePayload": {
# 					"RuleDisabled": false,
# 					"Sql": "SELECT * FROM '$aws/events/presence/connected/+'",
# 					"Actions": [
# 						{
# 							"Lambda": {
# 								"FunctionArn": {
# 									"Fn::GetAtt": [
# 										"ConnectLambdaFunction",
# 										"Arn"
# 									]
# 								}
# 							}
# 						}
# 					]
# 				},
# 				"RuleName": "connect"
# 			}
# 		},
# 		"ConnectLambdaPermissionIotTopicRule1": {
# 			"Type": "AWS::Lambda::Permission",
# 			"Properties": {
# 				"FunctionName": {
# 					"Fn::GetAtt": [
# 						"ConnectLambdaFunction",
# 						"Arn"
# 					]
# 				},
# 				"Action": "lambda:InvokeFunction",
# 				"Principal": "iot.amazonaws.com",
# 				"SourceArn": {
# 					"Fn::Join": [
# 						"",
# 						[
# 							"arn:",
# 							{
# 								"Ref": "AWS::Partition"
# 							},
# 							":iot:",
# 							{
# 								"Ref": "AWS::Region"
# 							},
# 							":",
# 							{
# 								"Ref": "AWS::AccountId"
# 							},
# 							":rule/",
# 							{
# 								"Ref": "ConnectIotTopicRule1"
# 							}
# 						]
# 					]
# 				}
# 			}
# 		},









# 	{
# 	"AWSTemplateFormatVersion": "2010-09-09",
# 	"Description": "The AWS CloudFormation template for this Serverless application",
# 	"Resources": {
# 		"ListLogGroup": {
# 			"Type": "AWS::Logs::LogGroup",
# 			"Properties": {
# 				"LogGroupName": "/aws/lambda/online__list",
# 				"RetentionInDays": 14
# 			}
# 		},
# 		"CountLogGroup": {
# 			"Type": "AWS::Logs::LogGroup",
# 			"Properties": {
# 				"LogGroupName": "/aws/lambda/online__count",
# 				"RetentionInDays": 14
# 			}
# 		},
# 		"ConnectLogGroup": {
# 			"Type": "AWS::Logs::LogGroup",
# 			"Properties": {
# 				"LogGroupName": "/aws/lambda/online__connect",
# 				"RetentionInDays": 14
# 			}
# 		},
# 		"DisconnectLogGroup": {
# 			"Type": "AWS::Logs::LogGroup",
# 			"Properties": {
# 				"LogGroupName": "/aws/lambda/online__disconnect",
# 				"RetentionInDays": 14
# 			}
# 		},
# 		"IamRoleLambdaExecution": {
# 			"Type": "AWS::IAM::Role",
# 			"Properties": {
# 				"AssumeRolePolicyDocument": {
# 					"Version": "2012-10-17",
# 					"Statement": [
# 						{
# 							"Effect": "Allow",
# 							"Principal": {
# 								"Service": [
# 									"lambda.amazonaws.com"
# 								]
# 							},
# 							"Action": [
# 								"sts:AssumeRole"
# 							]
# 						}
# 					]
# 				},
# 				"Policies": [
# 					{
# 						"PolicyName": {
# 							"Fn::Join": [
# 								"-",
# 								[
# 									"online",
# 									"prod",
# 									"lambda"
# 								]
# 							]
# 						},
# 						"PolicyDocument": {
# 							"Version": "2012-10-17",
# 							"Statement": [
# 								{
# 									"Effect": "Allow",
# 									"Action": [
# 										"logs:CreateLogStream",
# 										"logs:CreateLogGroup"
# 									],
# 									"Resource": [
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__list:*"
# 										},
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__count:*"
# 										},
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__connect:*"
# 										},
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__disconnect:*"
# 										}
# 									]
# 								},
# 								{
# 									"Effect": "Allow",
# 									"Action": [
# 										"logs:PutLogEvents"
# 									],
# 									"Resource": [
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__list:*:*"
# 										},
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__count:*:*"
# 										},
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__connect:*:*"
# 										},
# 										{
# 											"Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/online__disconnect:*:*"
# 										}
# 									]
# 								},
# 								{
# 									"Effect": "Allow",
# 									"Action": [
# 										"ssm:GetParameter",
# 										"ssm:GetParameters",
# 										"ssm:GetParametersByPath"
# 									],
# 									"Resource": [
# 										{
# 											"Fn::Join": [
# 												":",
# 												[
# 													"arn:aws:ssm",
# 													{
# 														"Ref": "AWS::Region"
# 													},
# 													{
# 														"Ref": "AWS::AccountId"
# 													},
# 													"parameter/bugsnag/*"
# 												]
# 											]
# 										}
# 									]
# 								},
# 								{
# 									"Effect": "Allow",
# 									"Action": [
# 										"lambda:InvokeFunction"
# 									],
# 									"Resource": [
# 										{
# 											"Fn::Join": [
# 												":",
# 												[
# 													"arn:aws:lambda",
# 													{
# 														"Ref": "AWS::Region"
# 													},
# 													{
# 														"Ref": "AWS::AccountId"
# 													},
# 													"function",
# 													"online__*"
# 												]
# 											]
# 										}
# 									]
# 								},
# 								{
# 									"Effect": "Allow",
# 									"Action": [
# 										"dynamodb:GetItem",
# 										"dynamodb:UpdateItem"
# 									],
# 									"Resource": [
# 										{
# 											"Fn::GetAtt": [
# 												"SocketTable",
# 												"Arn"
# 											]
# 										}
# 									]
# 								},
# 								{
# 									"Effect": "Allow",
# 									"Action": "iot:Publish",
# 									"Resource": [
# 										{
# 											"Fn::Join": [
# 												":",
# 												[
# 													"arn:aws:iot",
# 													{
# 														"Ref": "AWS::Region"
# 													},
# 													{
# 														"Ref": "AWS::AccountId"
# 													},
# 													"topic/user"
# 												]
# 											]
# 										}
# 									]
# 								}
# 							]
# 						}
# 					}
# 				],
# 				"Path": "/",
# 				"RoleName": {
# 					"Fn::Join": [
# 						"-",
# 						[
# 							"online",
# 							"prod",
# 							{
# 								"Ref": "AWS::Region"
# 							},
# 							"lambdaRole"
# 						]
# 					]
# 				}
# 			}
# 		},
# 		"ListLambdaFunction": {
# 			"Type": "AWS::Lambda::Function",
# 			"Properties": {
# 				"Code": {
# 					"S3Bucket": "deployments.jacksclub-prod.eu-west-1",
# 					"S3Key": "serverless/online/prod/1608739421971-2020-12-23T16:03:41.971Z/list.zip"
# 				},
# 				"FunctionName": "online__list",
# 				"Handler": "src/lambda/list.default",
# 				"MemorySize": 256,
# 				"Role": {
# 					"Fn::GetAtt": [
# 						"IamRoleLambdaExecution",
# 						"Arn"
# 					]
# 				},
# 				"Runtime": "nodejs12.x",
# 				"Timeout": 30,
# 				"Environment": {
# 					"Variables": {
# 						"BUGSNAG_API_KEY": "067582465252a570c6a0d2d3a6eea3e3",
# 						"IOT_ENDPOINT": "alzvnvwy9ctfg-ats.iot.eu-west-1.amazonaws.com"
# 					}
# 				}
# 			},
# 			"DependsOn": [
# 				"ListLogGroup"
# 			]
# 		},
# 		"ListLambdaVersionwgb3thSztWjyY7ToxDJ1pyKhin84FAxlyYqC8SeCnI": {
# 			"Type": "AWS::Lambda::Version",
# 			"DeletionPolicy": "Retain",
# 			"Properties": {
# 				"FunctionName": {
# 					"Ref": "ListLambdaFunction"
# 				},
# 				"CodeSha256": "rLJOpwhBpQYe3Hexq39iOCAbpRVEg9mwNUvWJKc8iHA="
# 			}
# 		},
# 		"CountLambdaFunction": {
# 			"Type": "AWS::Lambda::Function",
# 			"Properties": {
# 				"Code": {
# 					"S3Bucket": "deployments.jacksclub-prod.eu-west-1",
# 					"S3Key": "serverless/online/prod/1608739421971-2020-12-23T16:03:41.971Z/count.zip"
# 				},
# 				"FunctionName": "online__count",
# 				"Handler": "src/lambda/count.default",
# 				"MemorySize": 256,
# 				"Role": {
# 					"Fn::GetAtt": [
# 						"IamRoleLambdaExecution",
# 						"Arn"
# 					]
# 				},
# 				"Runtime": "nodejs12.x",
# 				"Timeout": 30,
# 				"Environment": {
# 					"Variables": {
# 						"BUGSNAG_API_KEY": "067582465252a570c6a0d2d3a6eea3e3",
# 						"IOT_ENDPOINT": "alzvnvwy9ctfg-ats.iot.eu-west-1.amazonaws.com"
# 					}
# 				}
# 			},
# 			"DependsOn": [
# 				"CountLogGroup"
# 			]
# 		},
# 		"CountLambdaVersionEzdgiQeM9hjYK8OdbEtTrumpwhy49ggBNxAlWIvez0": {
# 			"Type": "AWS::Lambda::Version",
# 			"DeletionPolicy": "Retain",
# 			"Properties": {
# 				"FunctionName": {
# 					"Ref": "CountLambdaFunction"
# 				},
# 				"CodeSha256": "DqKIN2C+9fYSWsVzTF0t0qiyJRX5YkSMwwzXfcw8fMA="
# 			}
# 		},
# 		"ConnectLambdaFunction": {
# 			"Type": "AWS::Lambda::Function",
# 			"Properties": {
# 				"Code": {
# 					"S3Bucket": "deployments.jacksclub-prod.eu-west-1",
# 					"S3Key": "serverless/online/prod/1608739421971-2020-12-23T16:03:41.971Z/connect.zip"
# 				},
# 				"FunctionName": "online__connect",
# 				"Handler": "src/lambda/connect.default",
# 				"MemorySize": 256,
# 				"Role": {
# 					"Fn::GetAtt": [
# 						"IamRoleLambdaExecution",
# 						"Arn"
# 					]
# 				},
# 				"Runtime": "nodejs12.x",
# 				"Timeout": 30,
# 				"Environment": {
# 					"Variables": {
# 						"BUGSNAG_API_KEY": "067582465252a570c6a0d2d3a6eea3e3",
# 						"IOT_ENDPOINT": "alzvnvwy9ctfg-ats.iot.eu-west-1.amazonaws.com"
# 					}
# 				}
# 			},
# 			"DependsOn": [
# 				"ConnectLogGroup"
# 			]
# 		},
# 		"ConnectLambdaVersionmGSWSF7zGrURv786amkaCQpDUwqIkxbSuI1ACgA0Os": {
# 			"Type": "AWS::Lambda::Version",
# 			"DeletionPolicy": "Retain",
# 			"Properties": {
# 				"FunctionName": {
# 					"Ref": "ConnectLambdaFunction"
# 				},
# 				"CodeSha256": "JdSrUxTwlKK0AHgCNpPB+xUg1QyohXLykCSD3l7vT44="
# 			}
# 		},
# 		"DisconnectLambdaFunction": {
# 			"Type": "AWS::Lambda::Function",
# 			"Properties": {
# 				"Code": {
# 					"S3Bucket": "deployments.jacksclub-prod.eu-west-1",
# 					"S3Key": "serverless/online/prod/1608739421971-2020-12-23T16:03:41.971Z/disconnect.zip"
# 				},
# 				"FunctionName": "online__disconnect",
# 				"Handler": "src/lambda/disconnect.default",
# 				"MemorySize": 256,
# 				"Role": {
# 					"Fn::GetAtt": [
# 						"IamRoleLambdaExecution",
# 						"Arn"
# 					]
# 				},
# 				"Runtime": "nodejs12.x",
# 				"Timeout": 30,
# 				"Environment": {
# 					"Variables": {
# 						"BUGSNAG_API_KEY": "067582465252a570c6a0d2d3a6eea3e3",
# 						"IOT_ENDPOINT": "alzvnvwy9ctfg-ats.iot.eu-west-1.amazonaws.com"
# 					}
# 				}
# 			},
# 			"DependsOn": [
# 				"DisconnectLogGroup"
# 			]
# 		},
# 		"DisconnectLambdaVersionvRYesEwblJU9J6CfmvLDYAHmw0QiKLfEg6wintGKU": {
# 			"Type": "AWS::Lambda::Version",
# 			"DeletionPolicy": "Retain",
# 			"Properties": {
# 				"FunctionName": {
# 					"Ref": "DisconnectLambdaFunction"
# 				},
# 				"CodeSha256": "OVtKZQlEzmhCXyW0+3D4fLGBmIJ2sUsPfYpgw6r3fW0="
# 			}
# 		},
# 		"CountEventsRuleSchedule1": {
# 			"Type": "AWS::Events::Rule",
# 			"Properties": {
# 				"ScheduleExpression": "rate(5 minutes)",
# 				"State": "ENABLED",
# 				"Targets": [
# 					{
# 						"Input": "{\"warmer\":true}",
# 						"Arn": {
# 							"Fn::GetAtt": [
# 								"CountLambdaFunction",
# 								"Arn"
# 							]
# 						},
# 						"Id": "countSchedule"
# 					}
# 				]
# 			}
# 		},
# 		"CountLambdaPermissionEventsRuleSchedule1": {
# 			"Type": "AWS::Lambda::Permission",
# 			"Properties": {
# 				"FunctionName": {
# 					"Fn::GetAtt": [
# 						"CountLambdaFunction",
# 						"Arn"
# 					]
# 				},
# 				"Action": "lambda:InvokeFunction",
# 				"Principal": "events.amazonaws.com",
# 				"SourceArn": {
# 					"Fn::GetAtt": [
# 						"CountEventsRuleSchedule1",
# 						"Arn"
# 					]
# 				}
# 			}
# 		},
# 		"ConnectIotTopicRule1": {
# 			"Type": "AWS::IoT::TopicRule",
# 			"Properties": {
# 				"TopicRulePayload": {
# 					"RuleDisabled": false,
# 					"Sql": "SELECT * FROM '$aws/events/presence/connected/+'",
# 					"Actions": [
# 						{
# 							"Lambda": {
# 								"FunctionArn": {
# 									"Fn::GetAtt": [
# 										"ConnectLambdaFunction",
# 										"Arn"
# 									]
# 								}
# 							}
# 						}
# 					]
# 				},
# 				"RuleName": "connect"
# 			}
# 		},
# 		"ConnectLambdaPermissionIotTopicRule1": {
# 			"Type": "AWS::Lambda::Permission",
# 			"Properties": {
# 				"FunctionName": {
# 					"Fn::GetAtt": [
# 						"ConnectLambdaFunction",
# 						"Arn"
# 					]
# 				},
# 				"Action": "lambda:InvokeFunction",
# 				"Principal": "iot.amazonaws.com",
# 				"SourceArn": {
# 					"Fn::Join": [
# 						"",
# 						[
# 							"arn:",
# 							{
# 								"Ref": "AWS::Partition"
# 							},
# 							":iot:",
# 							{
# 								"Ref": "AWS::Region"
# 							},
# 							":",
# 							{
# 								"Ref": "AWS::AccountId"
# 							},
# 							":rule/",
# 							{
# 								"Ref": "ConnectIotTopicRule1"
# 							}
# 						]
# 					]
# 				}
# 			}
# 		},
# 		"DisconnectIotTopicRule1": {
# 			"Type": "AWS::IoT::TopicRule",
# 			"Properties": {
# 				"TopicRulePayload": {
# 					"RuleDisabled": false,
# 					"Sql": "SELECT * FROM '$aws/events/presence/disconnected/+'",
# 					"Actions": [
# 						{
# 							"Lambda": {
# 								"FunctionArn": {
# 									"Fn::GetAtt": [
# 										"DisconnectLambdaFunction",
# 										"Arn"
# 									]
# 								}
# 							}
# 						}
# 					]
# 				},
# 				"RuleName": "disconnect"
# 			}
# 		},
# 		"DisconnectLambdaPermissionIotTopicRule1": {
# 			"Type": "AWS::Lambda::Permission",
# 			"Properties": {
# 				"FunctionName": {
# 					"Fn::GetAtt": [
# 						"DisconnectLambdaFunction",
# 						"Arn"
# 					]
# 				},
# 				"Action": "lambda:InvokeFunction",
# 				"Principal": "iot.amazonaws.com",
# 				"SourceArn": {
# 					"Fn::Join": [
# 						"",
# 						[
# 							"arn:",
# 							{
# 								"Ref": "AWS::Partition"
# 							},
# 							":iot:",
# 							{
# 								"Ref": "AWS::Region"
# 							},
# 							":",
# 							{
# 								"Ref": "AWS::AccountId"
# 							},
# 							":rule/",
# 							{
# 								"Ref": "DisconnectIotTopicRule1"
# 							}
# 						]
# 					]
# 				}
# 			}
# 		},
# 		"SocketTable": {
# 			"Type": "AWS::DynamoDB::Table",
# 			"Properties": {
# 				"TableName": "online__sockets",
# 				"BillingMode": "PAY_PER_REQUEST",
# 				"AttributeDefinitions": [
# 					{
# 						"AttributeName": "id",
# 						"AttributeType": "S"
# 					}
# 				],
# 				"KeySchema": [
# 					{
# 						"AttributeName": "id",
# 						"KeyType": "HASH"
# 					}
# 				],
# 				"Tags": [
# 					{
# 						"Key": "TableName",
# 						"Value": "online__sockets"
# 					},
# 					{
# 						"Key": "Service",
# 						"Value": "online"
# 					}
# 				]
# 			}
# 		}
# 	},
# 	"Outputs": {
# 		"ServerlessDeploymentBucketName": {
# 			"Value": "deployments.jacksclub-prod.eu-west-1"
# 		},
# 		"ListLambdaFunctionQualifiedArn": {
# 			"Description": "Current Lambda function version",
# 			"Value": {
# 				"Ref": "ListLambdaVersionwgb3thSztWjyY7ToxDJ1pyKhin84FAxlyYqC8SeCnI"
# 			}
# 		},
# 		"CountLambdaFunctionQualifiedArn": {
# 			"Description": "Current Lambda function version",
# 			"Value": {
# 				"Ref": "CountLambdaVersionEzdgiQeM9hjYK8OdbEtTrumpwhy49ggBNxAlWIvez0"
# 			}
# 		},
# 		"ConnectLambdaFunctionQualifiedArn": {
# 			"Description": "Current Lambda function version",
# 			"Value": {
# 				"Ref": "ConnectLambdaVersionmGSWSF7zGrURv786amkaCQpDUwqIkxbSuI1ACgA0Os"
# 			}
# 		},
# 		"DisconnectLambdaFunctionQualifiedArn": {
# 			"Description": "Current Lambda function version",
# 			"Value": {
# 				"Ref": "DisconnectLambdaVersionvRYesEwblJU9J6CfmvLDYAHmw0QiKLfEg6wintGKU"
# 			}
# 		}
# 	}
# }
