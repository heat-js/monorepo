
import { remark } from 'remark';
import Html	from 'remark-html';
import Directive from 'remark-directive';
import Container from './renderer/__container';
import Text from './renderer/__text';

export const html = async (content) => {
	let result = await remark()
		.use(Html)
		.use(Directive)
		.use(Container)
		.process(content);

	// --------------------------------------------------------------
	// fix the issue with Directives not being able to set classes.

	result = result.toString();
	result = result.replace(/(id\=\"user\-content\-)/g, 'class="');
	result = result.trim();

	return result;
}

export const text = async (content) => {
	let result = await (remark()
		.use(Text)
		.use(Directive)
		.process(content));

	return result.toString();
}
