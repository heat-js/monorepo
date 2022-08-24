
import { remark } from 'remark'
import Html	from 'remark-html'
import Directive from 'remark-directive'
import Container from './renderer/container'
import Text from './renderer/text';

export html = (content) ->
	result = await remark()
		.use Html
		.use Directive
		.use Container
		.process content

	# --------------------------------------------------------------
	# fix the issue with Directives not being able to set classes.

	result = result.toString()
	result = result.replace(/(id\=\"user\-content\-)/g, 'class="')
	result = result.trim()

	return result

export text = (content) ->
	result = await remark()
		.use Text
		.use Directive
		.process content

	return result.toString()
