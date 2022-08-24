
import render from 'preact-render-to-string'
import { h } from 'preact'

const Parent = ({ children }) => {
	console.log('Parent');
	return (<div class='parent'>{children}</div>)
}

const Child = ({ children }) => {
	console.log('Child');
	return (<div class='child'>{children}</div>)
}

const html = (
	<Parent>
		<Child>Test</Child>
	</Parent>
)

console.log('html', render(html));
