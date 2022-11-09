import { test } from "../../helper";

export class EnvParser {
	private data: { [key:string]: string };

	constructor(data) {
		this.data = data;
	}

	private get(name:string, defaultValue:any, defaultTestingValue:any) {
		const value = this.data[name];

		if(typeof value !== 'undefined') {
			return value;
		}

		if(typeof defaultValue !== 'undefined') {
			return defaultValue;
		}

		if(test()) {
			return defaultTestingValue;
		}

		throw new TypeError(`Environment variable "${name}" hasn't been set.`);
	}

	str(name:string, defaultValue:string):string {
		return String(this.get(name, defaultValue, ''))
	}

	int(name:string, defaultValue:number):number {
		return parseInt(this.get(name, defaultValue, 0), 10)
	}

	float(name:string, defaultValue:number):number {
		return parseFloat(this.get(name, defaultValue, 0))
	}

	bool(name:string, defaultValue:boolean):boolean {
		const value = this.get(name, defaultValue, false);

		if([true, 1, 'true', 'TRUE', 'yes', '1'].includes(value)) {
			return true;
		}

		if([false, 0, 'false', 'FALSE', 'no', '0'].includes(value)) {
			return false;
		}

		return !!value;
	}

	array(name:string, defaultValue:[], sep:string = ','):String[] {
		const value = this.get(name, defaultValue, []);

		if(Array.isArray(value)) {
			return value.map(String);
		}

		if(typeof value === 'string') {
			return value.split(sep).map(item => String(item).trim());
		}

		throw new TypeError(`Environment variable "${name}" isn't an array.`);
	}

	json(name:string, defaultValue:any) {
		const value = this.get(name, defaultValue, {});

		if(typeof value === 'object' && value !== null) {
			return value;
		}

		try {
			return JSON.parse(value);
		} catch(error) {
			throw new TypeError(`Environment variable ${ name } isn't valid JSON.`);
		}
	}

	enum (name:string, possibilities:string[], defaultValue:string) {
		const value = this.get(name, defaultValue, '');

		if(!possibilities.includes(value)) {
			throw new TypeError(
				`Environment variable ${ name } must contain one of the following values: ${possibilities.join(', ')}.`
			);
		}

		return value;
	}
}
