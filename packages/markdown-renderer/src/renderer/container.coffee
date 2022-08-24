
import { visit } from 'unist-util-visit'

export default ->
	return (tree) ->
		visit tree, (node) ->
			switch node.type
				when 'textDirective', 'leafDirective', 'containerDirective'
					data = node.data or ( node.data = {} )

					data.hName			= 'div'
					data.hProperties	= {
						id: node.name
					}
