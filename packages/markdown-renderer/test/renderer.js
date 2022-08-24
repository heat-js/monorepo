
import { html, text } from '../src/__index';

describe('Renderer', () => {

	const content = "# Hi Kennedy,\n\nSome *random* **text**.\n\n- One\n- Two\n- Three\n\n1. One\n2. Two\n3. Three\n\n> Blockquotes\n\n<https://www.markdownguide.org>\n\n:::center\n[A link](http://test.com)\n:::\n\nKind regards,\nJack";

	// const content = `
	// 	# Hi Kennedy,

	// 	Some *random* **text**.

	// 	- One
	// 	- Two
	// 	- Three

	// 	1. One
	// 	2. Two
	// 	3. Three

	// 	> Blockquotes

	// 	<https://www.markdownguide.org>

	// 	:::center
	// 	[A link](http://test.com)
	// 	:::

	// 	Kind regards,
	// 	Jack
	// `;

	it('should parse to html', async () => {
		const result = await html(content);

		expect(result)
			.toBe(`<h1>Hi Kennedy,</h1>
<p>Some <em>random</em> <strong>text</strong>.</p>
<ul>
<li>One</li>
<li>Two</li>
<li>Three</li>
</ul>
<ol>
<li>One</li>
<li>Two</li>
<li>Three</li>
</ol>
<blockquote>
<p>Blockquotes</p>
</blockquote>
<p><a href=\"https://www.markdownguide.org\">https://www.markdownguide.org</a></p>
<div class="center"><p><a href=\"http://test.com\">A link</a></p></div>
<p>Kind regards,
Jack</p>`)
	});

	it('should parse to text', async () => {
		const result = await text(content);

		console.log(JSON.stringify(result));
		expect(result)
			.toBe('Hi Kennedy,\n\nSome random text.\n\n*   One\n*   Two\n*   Three\n\n1.  One\n2.  Two\n3.  Three\n\n> Blockquotes\n\nhttps://www.markdownguide.org\n\nhttp://test.com\n\nKind regards,\nJack\n');
	});
});
