import escape from "escape-html";

const ifExpression = (key, template, variables) => {
	if (typeof variables[key] !== "undefined") {
		return template;
	}

	return "";
};

const unless = (key, template, variables) => {
	if (typeof variables[key] === "undefined") {
		return template;
	}

	return "";
};

const each = (key, template, variables) => {
	let list = variables[key];
	if (typeof list === "undefined") {
		return "";
	}

	return list.map(function(item) {
		return render(template, {
			'this': item
		});
	}).join('');
};

const capitalize = (value) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const render = (content, variables = {}) => {
	return content
		.replace(
			/\{\{ *\#(?<expression>[a-z]+) +([a-z0-9\-\_]+) *\}\}([^#]*)(\{\{ *\/\k<expression> *\}\})/gi,
			(match, expression, key, template) => {
				switch (expression) {
					case "if":
					case "exists":
						return ifExpression(key, template, variables);
					case "unless":
						return unless(key, template, variables);
					case "for":
					case "each":
						return each(key, template, variables);
					default:
						return match;
				}
	 		}
		)
		.replace(
			/\{\{(\!?)([a-z]*) *([a-z0-9\-\_]+) *\}\}/gi,
			(match, unsafe, helper, key) => {
				let value = variables[key];
				if (typeof value === "undefined") {
					return match;
				}
				if (helper) {
					switch (helper) {
						case "cap":
						case "capitalize":
							value = capitalize(value);
							break;
						case "upper":
						case "uppercase":
							value = value.toUpperCase();
							break;
						case "lower":
						case "lowercase":
							value = value.toLowerCase();
							break;
					}
				}

				if (unsafe === "!") {
					return value;
				}

				return escape(value);
			}
		);
};
