
import { visit } from 'unist-util-visit';

export default () => {
	return (tree) => {
		visit(tree, (node) => {
			switch (node.type) {
				case 'textDirective':
				case 'leafDirective':
				case 'containerDirective':
					let data = node.data || (node.data = {});
					data.hName = 'div';
					data.hProperties = {
						id: node.name
					};
					break;
			}
		});
	};
};
