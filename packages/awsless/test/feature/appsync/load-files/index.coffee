
import loadFiles	from '../../../../src/feature/appsync/load-files'
import path			from 'path'

describe 'Load appsync files', ->

	root = path.join __dirname, '_files'

	it 'should load appsync files correctly', ->
		result = await loadFiles path.join root, 'test1'
		expect result
			.toStrictEqual {
				schema: expect.any String
				resolvers: [
					{
						id:			'QuerySearch'
						type:		'Query'
						field:		'search'
						request:	expect.any String
						response:	expect.any String
						dataSource:	{
							key:	'none'
							type:	'none'
						}
					}
					{
						id:			'QueryPosts'
						type:		'Query'
						field:		'posts'
						request:	expect.any String
						response:	expect.any String
						dataSource:	{
							key:	'ffde7696b48ebdce'
							type:	'lambda'
							value:	'posts__list'
						}
					}
				]
			}
