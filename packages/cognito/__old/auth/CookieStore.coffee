import { getCookie, setCookie, removeCookie } from "$utils/cookie"
import { browser } from '$app/env';

export default class CookieStore

	constructor: ->
		@hydratedData = {}

	hydrate: (@hydratedData) ->

	get: (key) ->
		if browser
			return getCookie key

		if typeof @hydratedData[key] isnt 'undefined'
			try
				return JSON.parse @hydratedData[key]
			catch _
				return @hydratedData[key]

	set: (key, value) ->
		if browser
			return setCookie key, value

		@hydratedData[key] = value
		return @

	remove: (key) ->
		if browser
			return removeCookie key

		delete @hydratedData[key]

	# _get: ->
	# 	if browser
	# 		return getCookie(@namespace) or {}

	# 	return @hydratedData

	# _update: (fn) ->
	# 	data = fn @_get()

	# 	if Object.keys(data).length
	# 		setCookie @namespace, data
	# 	else
	# 		removeCookie @namespace

	# hydrate: (@hydratedData) ->

	# set: (name, value) ->
	# 	@_update (data) ->
	# 		data[name] = value
	# 		return data;

	# has: (name) ->
	# 	return typeof @get(name) isnt 'undefined'

	# get: (name) ->
	# 	return @_get()[name]

	# 	# if browser
	# 	# 	return getCookie key

	# 	# if typeof @data[key] isnt 'undefined'
	# 	# 	return @data[key]

	# 	# if typeof @hydratedData[key] isnt 'undefined'
	# 	# 	try
	# 	# 		return JSON.parse @hydratedData[key]
	# 	# 	catch _
	# 	# 		return @hydratedData[key]

	# 	# return undefined

	# remove: (name) ->
	# 	@_update (data) ->
	# 		delete data[name]
	# 		return data;

	# 	# delete @data[name]
	# 	# @_store()

	# 	# key = @key name
	# 	# if browser
	# 	# 	removeCookie key
	# 	# else
	# 	# 	delete @data[key]
