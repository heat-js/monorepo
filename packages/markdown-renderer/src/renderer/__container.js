
import { visit } from 'unist-util-visit';

export default async () => {
	return function(tree) {
		return visit(tree, function(node) {
			switch (node.type) {
				case 'textDirective':
				case 'leafDirective':
				case 'containerDirective':
					let data = node.data || (node.data = {});
					data.hName = 'div';
					return data.hProperties = {
						id: node.name
					};
			}
		});
	};
};
