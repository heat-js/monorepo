
import { playSuccess } from '../../src/feature/sound'

describe 'Sound', ->

	it 'should play success sound', ->
		await playSuccess()
