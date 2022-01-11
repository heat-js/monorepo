
import { mergeTypeDefs }	from '@graphql-tools/merge'
import { parse }			from 'graphql/language'
import listFiles			from '../fs/list-files-recursive'
import parseTemplate		from '../template/parse'
import checksum				from '../crypto/checksum'
import path 				from 'path'
import fs 					from 'fs'
import capitalize			from 'capitalize'

filterByExtensions = (files, extensions) ->
	return files.filter (file) ->
		extension = path
			.extname file
			.toLowerCase()

		return extensions.includes extension

assertValidateResolver = (definitions, item) ->
	for definition in definitions
		if item.type is definition.name?.value
			for field in definition.fields
				if item.field is field.name?.value
					return true

	throw new Error "No graphql definition found for type '#{ item.type }' with field '#{ item.field }'"

getTemplate = (templates, key) ->
	if typeof key isnt 'string'
		throw new Error "Appsync mapping template not found: #{ key }"

	if key[0] isnt '/'
		key = '/' + key

	template = templates[ key ]
	if typeof template isnt 'undefined'
		return template

	throw new Error "Appsync mapping template not found: #{ key }"

getDataSource = (item) ->
	if item.Lambda
		return {
			type:	'lambda'
			key:	checksum JSON.stringify { lambda: item.Lambda }
			value:	item.Lambda
		}

	return {
		type: 'none'
		key: 'none'
	}

export default (sourceFiles, mappingTemplates) ->
	try
		files = await listFiles sourceFiles

	catch error
		if error.code is 'ENOENT'
			throw new Error "Appsync template directory doesn't exist '#{ directory }'"

		throw error

	# console.log files

	schemaFiles		= filterByExtensions files, [ '.gql', '.graphql' ]
	resolverFiles	= filterByExtensions files, [ '.yml', '.yaml' ]
	templateFiles	= filterByExtensions files, [ '.vtl' ]

	types = await Promise.all schemaFiles.map (file) ->
		return fs.promises.readFile file, { encoding: 'utf8' }

	# console.log types

	schema = mergeTypeDefs types, {
		useSchemaDefinition:	true
		forceSchemaDefinition:	true
		throwOnConflict:		true
		commentDescriptions:	true
		reverseDirectives:		true
	}

	{ definitions } = parse schema

	# console.log 'schema', schema
	# # console.log 'definitions', definitions
	# console.log 'fields', definitions[2]
	# console.log 'fields', definitions[2].fields
	# console.log mappingTemplates, sourceFiles

	root = path.normalize mappingTemplates or sourceFiles
	# console.log root
	templates = {}
	await Promise.all templateFiles.map (file) ->
		template = await fs.promises.readFile file, { encoding: 'utf8' }
		templates[ file.replace root, '' ] = template

	# console.log 'templates', templates

	resolvers = []
	await Promise.all resolverFiles.map (file) ->
		items = await fs.promises.readFile file, { encoding: 'utf8' }
		items = parseTemplate items
		for item in items
			resolvers.push {
				id:	[
					capitalize item.Type
					capitalize item.Field
				].join ''
				type:			item.Type
				field:			item.Field
				request:		getTemplate templates, item.Request
				response:		getTemplate templates, item.Response
				dataSource:		getDataSource item
			}

	for resolver in resolvers
		assertValidateResolver definitions, resolver

	# console.log 'resolvers', resolvers

	return {
		schema
		resolvers
	}
