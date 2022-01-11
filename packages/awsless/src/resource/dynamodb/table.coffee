
import resource					from '../../feature/resource'
import { Ref, Split, GetAtt }	from '../../feature/cloudformation/fn'

getKeySchemaItem = (schema) ->
	keys = Object.keys schema
	if keys.length isnt 1
		throw new TypeError 'Invalid DynamoDB schema'

	type	= String keys[0]
	name	= String schema[ type ]
	return { type, name }

keySchema = (data) ->
	hash = getKeySchemaItem data.Hash or data.HASH
	list = [{
		AttributeName:	hash.name
		KeyType:		'HASH'
	}]

	sort = data.Sort or data.SORT or data.Range or data.RANGE
	if sort
		sort = getKeySchemaItem sort
		list.push {
			AttributeName:	sort.name
			KeyType:		'RANGE'
		}

	return { KeySchema: list }

provisionedIndex = (ctx, index) ->
	mode = ctx.string 'BillingMode', 'PAY_PER_REQUEST'
	if mode isnt 'PROVISIONED'
		return {}

	return {
		ProvisionedThroughput: {
			ReadCapacityUnits:	ctx.number "Indexes.#{ index }.RCU", 1
			WriteCapacityUnits: ctx.number 'WCU', 1
		}
	}

globalSecondaryIndexes = (ctx) ->
	indexes = ctx.array 'Indexes', []
	if not indexes.length
		return {}

	return {
		GlobalSecondaryIndexes: indexes.map (_, index) => {
			IndexName: ctx.string [ "Indexes.#{ index }.IndexName", "Indexes.#{ index }.Name" ]
			...keySchema ctx.object [ "Indexes.#{ index }.KeySchema", "Indexes.#{ index }.Schema" ]
			...provisionedIndex ctx, index

			Projection: {
				ProjectionType: ctx.string "Indexes.#{ index }.Projection", 'ALL'
			}
		}
	}

timeToLive = (ctx) ->
	attribute = ctx.string 'TTL', ''
	if not attribute
		return {}

	return {
		TimeToLiveSpecification: {
			AttributeName: attribute
			Enabled: true
		}
	}

billing = (ctx) ->
	mode = ctx.string 'BillingMode', 'PAY_PER_REQUEST'
	switch mode
		when 'PAY_PER_REQUEST' then return {
			BillingMode: 'PAY_PER_REQUEST'
		}

		when 'PROVISIONED'
			scaling ctx
			return {
				BillingMode: 'PROVISIONED'
				ProvisionedThroughput: {
					ReadCapacityUnits:	ctx.number 'RCU', 1
					WriteCapacityUnits: ctx.number 'WCU', 1
				}
			}

	throw new TypeError "Invalid DynamoDB billing mode: #{ mode }"

setDefinitions = (definitions, data) ->
	type = definitions[ data.name ]
	if type and type isnt data.type
		throw new TypeError 'Mixed DynamoDB schema types'

	definitions[ data.name ] = data.type

attributeDefinitions = (ctx) ->
	AttributeDefinitions = ctx.array 'AttributeDefinitions', []
	if AttributeDefinitions.length
		return { AttributeDefinitions }

	schemas = [
		ctx.object [ 'KeySchema', 'Schema' ]
		...( ctx.array 'Indexes', [] ).map ( item ) ->
			return item.KeySchema or item.Schema
	]

	definitions = {}
	for item in schemas
		hash = item.Hash or item.HASH
		sort = item.Sort or item.SORT or item.Range or item.RANGE
		setDefinitions definitions, getKeySchemaItem hash
		if sort
			setDefinitions definitions, getKeySchemaItem sort

	return {
		AttributeDefinitions: Object.entries(definitions).map ([ name, type ]) -> {
			AttributeName: name
			AttributeType: type
		}
	}

pointInTimeRecovery = (ctx) ->
	enabled = ctx.boolean 'PointInTimeRecovery', false
	if not enabled
		return {}

	return {
		PointInTimeRecoverySpecification: {
			PointInTimeRecoveryEnabled: true
		}
	}

streamSpecification = (ctx) ->
	stream = ctx.string 'Stream', ''
	if not stream
		return {}

	return {
		StreamSpecification: {
			StreamViewType: stream
		}
	}


scalableTarget = ({ name, resourceId, min, max, dimension }) -> {
	Type: 'AWS::ApplicationAutoScaling::ScalableTarget'
	Properties: {
		MaxCapacity: max
		MinCapacity: min
		ResourceId: resourceId
		RoleARN: GetAtt "#{ name }ScalingRole", 'Arn'
		ScalableDimension: dimension
		ServiceNamespace: 'dynamodb'
	}
}

scalingPolicy = ({ name, type, value, scaleIn, scaleOut, metricType }) -> {
	Type: 'AWS::ApplicationAutoScaling::ScalingPolicy'
	Properties: {
		PolicyName: "#{ name }#{ type }ScalingPolicy"
		PolicyType: 'TargetTrackingScaling'
		ScalingTargetId: Ref "#{ name }#{ type }ScalableTarget"
		TargetTrackingScalingPolicyConfiguration: {
			TargetValue:		value
			ScaleInCooldown:	scaleIn
			ScaleOutCooldown:	scaleOut
			PredefinedMetricSpecification: {
				PredefinedMetricType: metricType
			}
		}
	}
}

scaling = (ctx) ->
	tableName 		= ctx.string [ 'Name', 'TableName' ]
	writeScaling	= Object.keys(ctx.object 'Scaling.Write', {}).length > 0
	readScaling		= Object.keys(ctx.object 'Scaling.Read', {}).length > 0

	indexes = ctx
		.array 'Indexes', []
		.filter (index) ->
			return !!index.Scaling

	# indexScaling = indexes.length isnt 0

	# writeIndexes	= indexes.map (index) -> index.Scaling?.Write
	# readIndexes		= indexes.map (index) -> index.Scaling?.Read

	if not writeScaling and not readScaling and not indexes.length
		return

	# resoucee GetAtt ctx.name, 'Arn'

	if writeScaling
		ctx.addResource "#{ ctx.name }WriteScalableTarget", scalableTarget {
			resourceId:	"table/#{ tableName }"
			name:		ctx.name
			min:		ctx.number 'Scaling.Write.Min'
			max:		ctx.number 'Scaling.Write.Max'
			dimension:	ctx.number 'Scaling.Write.Dimension', 'dynamodb:table:WriteCapacityUnits'
		}

		ctx.addResource "#{ ctx.name }WriteScalingPolicy", scalingPolicy {
			name:		ctx.name
			type:		'Write'
			value:		ctx.number 'Scaling.Write.TargetValue', 80
			scaleIn:	ctx.number 'Scaling.Write.ScaleIn', 	60
			scaleOut:	ctx.number 'Scaling.Write.ScaleOut', 	60
			metricType:	ctx.number 'Scaling.Write.MetricType',	'DynamoDBWriteCapacityUtilization'
		}

	if readScaling
		ctx.addResource "#{ ctx.name }ReadScalableTarget", scalableTarget {
			resourceId:	"table/#{ tableName }"
			name:		ctx.name
			min:		ctx.number 'Scaling.Read.Min'
			max:		ctx.number 'Scaling.Read.Max'
			dimension:	ctx.number 'Scaling.Read.Dimension', 'dynamodb:table:ReadCapacityUnits'
		}

		ctx.addResource "#{ ctx.name }ReadScalingPolicy", scalingPolicy {
			name:		ctx.name
			type:		'Read'
			value:		ctx.number 'Scaling.Read.TargetValue',	80
			scaleIn:	ctx.number 'Scaling.Read.ScaleIn', 		60
			scaleOut:	ctx.number 'Scaling.Read.ScaleOut', 	60
			metricType:	ctx.number 'Scaling.Read.MetricType',	'DynamoDBReadCapacityUtilization'
		}

	resources = []
	if writeScaling or readScaling
		resources.push GetAtt ctx.name, 'Arn'

	for index, i in indexes
		indexName = ctx.string [ "Indexes.#{ i }.IndexName", "Indexes.#{ i }.Name" ]

		if Object.keys(ctx.object "Indexes.#{ i }.Scaling.Write", {}).length > 0

			ctx.addResource "#{ ctx.name }Index#{ i }WriteScalableTarget", scalableTarget {
				resourceId:	"table/#{ tableName }/index/#{ indexName }"
				name:		ctx.name
				min:		ctx.number "Indexes.#{ i }.Scaling.Write.Min"
				max:		ctx.number "Indexes.#{ i }.Scaling.Write.Max"
				dimension:	ctx.number "Indexes.#{ i }.Scaling.Write.Dimension", 'dynamodb:index:WriteCapacityUnits'
			}

			ctx.addResource "#{ ctx.name }Index#{ i }WriteScalingPolicy", scalingPolicy {
				name:		"#{ ctx.name }Index#{ i }"
				type:		'Write'
				value:		ctx.number "Indexes.#{ i }.Scaling.Write.TargetValue",	80
				scaleIn:	ctx.number "Indexes.#{ i }.Scaling.Write.ScaleIn", 		60
				scaleOut:	ctx.number "Indexes.#{ i }.Scaling.Write.ScaleOut", 	60
				metricType:	ctx.number "Indexes.#{ i }.Scaling.Write.MetricType",	'DynamoDBWriteCapacityUtilization'
			}

		if Object.keys(ctx.object "Indexes.#{ i }.Scaling.Read", {}).length > 0

			ctx.addResource "#{ ctx.name }Index#{ i }ReadScalableTarget", scalableTarget {
				resourceId:	"table/#{ tableName }/index/#{ indexName }"
				name:		ctx.name
				min:		ctx.number "Indexes.#{ i }.Scaling.Read.Min"
				max:		ctx.number "Indexes.#{ i }.Scaling.Read.Max"
				dimension:	ctx.number "Indexes.#{ i }.Scaling.Read.Dimension", 'dynamodb:index:ReadCapacityUnits'
			}

			ctx.addResource "#{ ctx.name }Index#{ i }ReadScalingPolicy", scalingPolicy {
				name:		"#{ ctx.name }Index#{ i }"
				type:		'Read'
				value:		ctx.number "Indexes.#{ i }.Scaling.Read.TargetValue",	80
				scaleIn:	ctx.number "Indexes.#{ i }.Scaling.Read.ScaleIn", 		60
				scaleOut:	ctx.number "Indexes.#{ i }.Scaling.Read.ScaleOut", 		60
				metricType:	ctx.number "Indexes.#{ i }.Scaling.Read.MetricType",	'DynamoDBReadCapacityUtilization'
			}

	ctx.addResource "#{ ctx.name }ScalingRole", {
		Type: 'AWS::IAM::Role'
		Properties: {
			Path: '/'
			AssumeRolePolicyDocument: {
				Version: '2012-10-17'
				Statement: [{
					Effect: 'Allow'
					Action: 'sts:AssumeRole'
					Principal: { Service: [ 'application-autoscaling.amazonaws.com' ] }
				}]
			}
			Policies:[{
				PolicyName: 'dynamodb-scaling-policy'
				PolicyDocument: {
					Version: '2012-10-17'
					Statement: [{
						Effect: 'Allow'
						Resource: resources
						Action: [
							'dynamodb:DescribeTable'
							'dynamodb:UpdateTable'
							'cloudwatch:PutMetricAlarm'
							'cloudwatch:DescribeAlarms'
							'cloudwatch:GetMetricStatistics'
							'cloudwatch:SetAlarmState'
							'cloudwatch:DeleteAlarms'
						]
					}]
				}
			}]
		}
	}

export default resource (ctx) ->
	name = ctx.string [ 'Name', 'TableName' ]
	ctx.addResource ctx.name, {
		Type: 'AWS::DynamoDB::Table'
		DeletionPolicy: ctx.string '#DeletionPolicy', 'Delete'
		Properties: {
			TableName: name
			...keySchema ctx.object [ 'KeySchema', 'Schema' ]
			...billing ctx
			...attributeDefinitions ctx
			...pointInTimeRecovery ctx
			...timeToLive ctx
			...streamSpecification ctx
			...globalSecondaryIndexes ctx
			Tags: [
				...ctx.array 'Tags', []
				{ Key: 'TableName', Value: name }
			]
		}
	}



# BetTableIdIndexWriteCapacity:
#   Type: AWS::ApplicationAutoScaling::ScalableTarget
#   Properties:
#     MaxCapacity: 100
#     MinCapacity: 50
#     ResourceId: !Join [ '/', [ table, !Ref BetTable,  index/id-index ]]
#     RoleARN: !GetAtt ScalingRole.Arn
#     ScalableDimension: dynamodb:index:WriteCapacityUnits
#     ServiceNamespace: dynamodb

# BetTableIdIndexWriteScalingPolicy:
#   Type: AWS::ApplicationAutoScaling::ScalingPolicy
#   Properties:
#     PolicyName: BetTableIdIndexWriteAutoScalingPolicy
#     PolicyType: TargetTrackingScaling
#     ScalingTargetId: !Ref BetTableIdIndexWriteCapacity
#     TargetTrackingScalingPolicyConfiguration:
#       TargetValue: 70
#       ScaleInCooldown: 60
#       ScaleOutCooldown: 60
#       PredefinedMetricSpecification:
#         PredefinedMetricType: DynamoDBWriteCapacityUtilization
