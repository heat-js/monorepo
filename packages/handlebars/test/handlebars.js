
import { render } from '../src/index';

describe('Variables', () => {
	it('should render variables', function() {
		const result = render("{{ test }}", {
			test: 'TEST'
		});
		expect(result).toBe('TEST');
	});

	it('should escape html', function() {
		const result = render("{{ foo }}", {
			foo: '<tag />'
		});
		expect(result).toBe('&lt;tag /&gt;');
	});

	it('should allow unsafe variables', function() {
		const result = render("{{! foo }}", {
			foo: '<tag />'
		});
		expect(result).toBe('<tag />');
	});

	it('should allow [-_0-9a-z] characters in variable names', function() {
		const result = render("{{ foo-bar }} {{ foo_bar }} {{ 123 }}", {
			'foo-bar': 1,
			'foo_bar': 2,
			'123': 3
		});
		expect(result).toBe('1 2 3');
	});

	it('should allow multiple variables', function() {
		const result = render("{{ foo }} {{ foo }} {{ bar }}", {
			foo: 'FOO',
			bar: 'BAR'
		});
		expect(result).toBe('FOO FOO BAR');
	});

	it('should have multi line support', function() {
		const result = render("{{ foo }}\n{{ foo }}\n{{ bar }}", {
			foo: 'FOO',
			bar: 'BAR'
		});
		expect(result).toBe("FOO\nFOO\nBAR");
	});

	it('should handle expressions', function() {
		let result = render("{{#if foo }}\n	<i>{{ foo }}</i>\n{{/if}}\n{{#if unknown }}\n	<i>{{ unknown }}</i>\n{{/if}}\n{{#each list }}\n	<i>{{ this }}</i>\n{{/each}}", {
			foo: 'FOO',
			bar: 'BAR',
			list: [1, 2, 3]
	  	});
		result = result.replace(/[\s]+/g, '').trim();

		expect(result).toBe("<i>FOO</i><i>1</i><i>2</i><i>3</i>");
	});

	it('should handle helpers', function() {
		let result = render("{{upper foo}}", {
			foo: 'foo'
		});
		expect(result).toBe("FOO");

		result = render("{{cap foo}}", {
			foo: 'foo'
		});
		expect(result).toBe("Foo");

		result = render("{{lower foo}}", {
			foo: 'FOO'
		});
		expect(result).toBe("foo");
	});
  });
