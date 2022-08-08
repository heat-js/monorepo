
import { inject } from '../src/index';

describe('Variables', () => {
	it('should inject variables', function() {
		const result = inject("{{ test }}", {
			test: 'TEST'
		});
		expect(result).toBe('TEST');
	});

	it('should escape html', function() {
		const result = inject("{{ foo }}", {
			foo: '<tag />'
		});
		expect(result).toBe('&lt;tag /&gt;');
	});

	it('should allow unsafe variables', function() {
		const result = inject("{{! foo }}", {
			foo: '<tag />'
		});
		expect(result).toBe('<tag />');
	});

	it('should allow [-_0-9a-z] characters in variable names', function() {
		const result = inject("{{ foo-bar }} {{ foo_bar }} {{ 123 }}", {
			'foo-bar': 1,
			'foo_bar': 2,
			'123': 3
		});
		expect(result).toBe('1 2 3');
	});

	it('should allow multiple variables', function() {
		const result = inject("{{ foo }} {{ foo }} {{ bar }}", {
			foo: 'FOO',
			bar: 'BAR'
		});
		expect(result).toBe('FOO FOO BAR');
	});

	it('should have multi line support', function() {
		const result = inject("{{ foo }}\n{{ foo }}\n{{ bar }}", {
			foo: 'FOO',
			bar: 'BAR'
		});
		expect(result).toBe("FOO\nFOO\nBAR");
	});

	it('should handle expressions', function() {
		let result = inject("{{#if foo }}\n	<i>{{ foo }}</i>\n{{/if}}\n{{#if unknown }}\n	<i>{{ unknown }}</i>\n{{/if}}\n{{#each list }}\n	<i>{{ this }}</i>\n{{/each}}", {
			foo: 'FOO',
			bar: 'BAR',
			list: [1, 2, 3]
	  	});
		result = result.replace(/[\s]+/g, '').trim();

		expect(result).toBe("<i>FOO</i><i>1</i><i>2</i><i>3</i>");
	});

	it('should handle helpers', function() {
		let result = inject("{{upper foo}}", {
			foo: 'foo'
		});
		expect(result).toBe("FOO");

		result = inject("{{cap foo}}", {
			foo: 'foo'
		});
		expect(result).toBe("Foo");

		result = inject("{{lower foo}}", {
			foo: 'FOO'
		});
		expect(result).toBe("foo");
	});
  });
