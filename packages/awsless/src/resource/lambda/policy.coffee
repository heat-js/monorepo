

import resource				from '../../feature/resource'
import createHash 			from '../../feature/crypto/hash'
import { isFn, isArn, Sub }	from '../../feature/cloudformation/fn'

uniqueArray = (array) ->
	array = array.map (item)->
		return JSON.stringify item

	return [ ...new Set array ].map (item) ->
		return JSON.parse item

toArray = (array) ->
	if Array.isArray array
		return array

	return [ array ]

statementKey = (statement) ->
	return [
		...toArray statement.Effect
		...toArray statement.Action
	].sort().join '-'

condenseStatements = (statements) ->
	list = {}
	for statement in statements
		key = statementKey statement
		entry = list[ key ]
		if not entry
			list[ key ] = {
				Effect:		statement.Effect
				Action:		statement.Action
				Resource:	toArray statement.Resource
			}
		else
			Object.assign entry, {
				Resource: [
					...entry.Resource
					...toArray statement.Resource
				]
			}

	return Object.values(list).map (entry) ->
		return { ...entry, Resource: uniqueArray entry.Resource }

export addManagedPolicy = (ctx, policy) ->
	if not isFn(policy) and not isArn(policy)
		policy = Sub "arn:${AWS::Partition}:iam::aws:policy/service-role/#{ policy }"

	policies = ctx.singleton 'lambda-managed-policies', []
	policies.push policy

export policyChecksum = (ctx) ->
	content = JSON.stringify [
		ctx.singleton 'lambda-managed-policies', []
		ctx.singleton 'lambda-policies', {}
	]
	return createHash 'md5', content, 'hex'

managedPolicyArns = (ctx) ->
	policies = ctx.singleton 'lambda-managed-policies', []
	policies = policies.map (policy) -> JSON.stringify policy
	policies = [ ...new Set policies ]
	policies = policies.map (policy) -> JSON.parse policy

	if not policies.length
		return { }

	return {
		ManagedPolicyArns: policies
	}

inlinePolicies = (ctx) ->
	list = ctx.singleton 'lambda-policies', {}
	if not Object.keys(list).length
		return {}

	policies = []
	for PolicyName, Statement of list
		policies.push {
			PolicyName
			PolicyDocument: {
				Version: '2012-10-17'
				Statement: condenseStatements Statement
			}
		}

	return {
		Policies: policies
	}

export default resource (ctx) ->

	statements = toArray ctx.any '#Properties', []
	if statements.length
		policies = ctx.singleton 'lambda-policies', {}
		policies[ctx.name] = [
			...( policies[ctx.name] or [] )
			...statements
		]

	ctx.once 'before-stringify-template', ->
		Stack	= ctx.string '@Config.Stack'
		Region	= ctx.string '@Config.Region'

		ctx.addResource "LambdaPolicyIamRole", {
			Type: 'AWS::IAM::Role'
			Region
			Properties: {
				Path: '/'
				RoleName: "#{ Stack }-#{ Region }-lambda-role"
				AssumeRolePolicyDocument: {
					Version: '2012-10-17'
					Statement: [ {
						Effect: 'Allow'
						Principal: {
							Service: [ 'lambda.amazonaws.com' ]
						}
						Action: [ 'sts:AssumeRole' ]
					} ]
				}
				...inlinePolicies ctx
				...managedPolicyArns ctx
			}
		}
