
export default class Reference

	setValue: (@value) ->

	toJSON: ->
		return @value
