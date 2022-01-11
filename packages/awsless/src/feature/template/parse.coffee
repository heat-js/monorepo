
import YAML							from 'js-yaml'
# import { cloudformationTags }		from 'js-yaml-cloudformation-schema'
import awsTypes						from './aws-yaml-types'
import customTypes					from './custom-yaml-types'

schema = YAML.DEFAULT_SCHEMA.extend [
	...awsTypes
	...customTypes
]

export default (data) ->
	return YAML.load data, { schema }
