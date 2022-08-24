
import { visit } from 'unist-util-visit';

export default () => {
	return (tree) => {
		visit(tree, (node) => {
			switch (node.type) {
				case "textDirective":
				case "leafDirective":
				case "containerDirective":
					// console.log node
					// node.type = 'root'
					node.type = "root";
					break;
				case "link":
					node.type = "text";
					node.value = node.url;
					break;
				case "emphasis":
				case "strong":
				case "heading":
					node.type = "paragraph";
					break;
				// case "text":
				// 	if(node.value.includes(':::')) {
				// 		node.value = '';
				// 	}
			}
		});
	};
};
