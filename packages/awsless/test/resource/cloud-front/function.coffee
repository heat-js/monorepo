
import Context		from '../../../src/context'
import Emitter		from '../../../src/emitter'
import cfFunction	from '../../../src/resource/cloud-front/function'

describe 'Resource CloudFront Function', ->

	it 'test', ->
		context = new Context {
			name: 	'Test'
			emitter: new Emitter
		}
		cfFunction context, 'TestFunction', {
			Name: 	'test-function'
			Handle: 'test/data/cloud-front/function/viewer-request'
		}

		await context.emitter.emit 'prepare-resource'

		resources = context.getResources()
		expect Object.keys resources
			.toStrictEqual [
				'TestFunction'
			]
	, 25000
