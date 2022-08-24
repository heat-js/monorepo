
import { visit } from 'unist-util-visit'

export default ->
	return (tree) ->
		visit tree, (node) ->
			switch node.type
				when 'textDirective', 'leafDirective', 'containerDirective'
					# console.log node
					# node.type = 'root'
					node.type = 'root'
				# when 'text'
				# 	if node.value.includes ':::'
				# 		node.value = ''

				when 'link'
					node.type = 'text'
					node.value = node.url

				when 'emphasis', 'strong', 'heading'
					node.type = 'paragraph'
