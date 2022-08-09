
import { remark } from 'remark'
import Html	from 'remark-html'
import Directive from 'remark-directive'
import  { convert } from 'html-to-text'
import Container from './renderer/container'

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
	result = await html content
	return convert result, {
		preserveNewlines: true,
		uppercaseHeadings: false,
		hideLinkHrefIfSameAsText: true,
		wordwrap: false
	}
