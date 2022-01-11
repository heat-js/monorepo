
export Select = (number, ...array) -> {
	'Fn::Select': [ number, ...array ]
}

export Split = (sep, string) -> {
	'Fn::Split': [ sep, string ]
}

export GetAtt = (...args) -> {
	'Fn::GetAtt': args
}

export Ref = (resource) -> {
	'Ref': resource
}

export Sub = (string) -> {
	'Fn::Sub': string
}

export isFn = (object) ->
	keys = Object.keys object
	if keys.length isnt 1
		return false

	return [
		'Ref'
		'Fn::Sub'
		'Fn::GetAtt'
		'Fn::Split'
		'Fn::Select'
		'Fn::ImportValue'
	].includes keys[0]

export isArn = (string) ->
	return typeof string is 'string' and 0 is string.indexOf 'arn:'
