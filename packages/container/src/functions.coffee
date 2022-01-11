import Predefinition from './predefinition'
import Add from './definition/add'
import Value from './definition/value'
import Alias from './definition/alias'
import Factory from './definition/factory'
import Get from './definition/get'

export add = (...args) ->
	new Predefinition Add, [args]

export get = (whom, ...args) ->
	new Predefinition Get, [whom, args]

export alias = (whom) ->
	new Predefinition Alias, [whom]

export factory = (func) ->
	new Predefinition Factory, [func]

export value = (obj) ->
	new Predefinition Value, [obj]
