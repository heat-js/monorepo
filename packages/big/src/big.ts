
import fromExponential from 'from-exponential';

export default class Big {

	private static DECIMALS = 20;
	private static SHIFT = BigInt('1' + '0'.repeat(Big.DECIMALS));

	static setDecimals(d:number) {
		this.DECIMALS = d;
		this.SHIFT = BigInt('1' + '0'.repeat(d));
		// console.log(this.SHIFT);
	}

	private static fromString(s:string): bigint {
		const str = fromExponential(s);
		const [ints, decis] = str.split('.').concat('');
		return BigInt(ints + decis.padEnd(Big.DECIMALS, '0').slice(0, Big.DECIMALS));
	}

	// static fromNumber(n:number): bigint {
	// 	return this.fromString(String(n));
	// }

	private static _rounded(value:bigint): bigint {
		// const r = BigInt(1);
		// const last = value % r;

		// return value + (last >= (r / BigInt(2)) ? r - last : -last);
		return value;
	}

	readonly n:bigint;

	constructor(value: Big|bigint|string|number) {
		if (value instanceof Big) {
			return value;
		}

		switch (typeof value) {
			case 'bigint':
				this.n = value;
				break;

			case 'string':
				this.n = Big.fromString(value);
				break;

			case 'number':
				this.n = Big.fromString(String(value));
				break;

			default:
				throw new Error(`Big.js invalid input type: ${typeof value}`);
		}
	}

	add(num:Big|string|number): Big {
		return new Big(this.n + new Big(num).n);
	}

	sub(num:Big|string|number): Big {
		return new Big(this.n - new Big(num).n);
	}

	div(num:Big|string|number): Big {
		return new Big(this.n * Big.SHIFT / new Big(num).n);
	}

	mul(num:Big|string|number): Big {
		return new Big(this.n * new Big(num).n / Big.SHIFT);
	}

	pow(num:number): Big {
		const isNeg = num < 0;
		const zero = BigInt(0);

		let n = this.n;
		let i = isNeg ? 0 - num : num;

		if(num == 0) {
			return new Big(n > zero ? Big.SHIFT : zero - Big.SHIFT);
		}

		while (--i > 0) {
			n = n * this.n / Big.SHIFT;
		}

		if(isNeg) {
			n = Big.SHIFT / (n / Big.SHIFT)
		}

		return new Big(n);
	}

	abs(): Big {
		return new Big(this.n < 0 ? this.n * BigInt(-1) : this.n);
	}

	eq(num:Big|string|number):boolean {
		return this.n === new Big(num).n;
	}

	lt(num:Big|string|number):boolean {
		return this.n < new Big(num).n;
	}

	lte(num:Big|string|number):boolean {
		return this.n <= new Big(num).n;
	}

	gt(num:Big|string|number):boolean {
		return this.n > new Big(num).n;
	}

	gte(num:Big|string|number):boolean {
		return this.n >= new Big(num).n;
	}

	// round(decimals = 0) {
	// 	return this.n >= new Big(num).n;
	// }

	ceil(decimals:number = 0):Big {
		const r = BigInt(10) ** BigInt(Big.DECIMALS - decimals);
		const n = this.n / r * r;

		return new Big(this.n - n > 0 ? n + r : n);
	}

	floor(decimals:number = 0):Big {
		const r = BigInt(10) ** BigInt(Big.DECIMALS - decimals);
		return new Big(this.n / r * r);
	}

	toFixed(decimals:number|undefined = undefined):string {
		const has = typeof decimals === 'number';
		const s = Big._rounded(this.n).toString();

		let p;
		if (s[0] === '-') {
			p = '-' + s.slice(1).padStart(Big.DECIMALS + 1, '0');
		}
		else {
			p = s.padStart(Big.DECIMALS + 1, '0');
		}

		const d = p.slice(-Big.DECIMALS).slice(0, has ? decimals : Big.DECIMALS);
		const f = Big.DECIMALS > 0 ? p.slice(0, -Big.DECIMALS) : p;

		if(d) {
			const r = f + '.' + d;
			return has ? r : r.replace(/\.?0*$/, '');
		}

		if(f == '-0') {
			return '0';
		}

		return f;
	}

	toString():string {
		return this.toFixed();

		// const s = this.toFixed();

		// if(s.indexOf('.') > -1) {
		// 	return s.replace(/\.?0*$/, '');
		// }

		// return s;
	}
}

// // console.log(new Big(1).multiply(2).toString(), 'big 1');
// // console.log(new Big(2).divide(2).toString(), 'big 2');
// // console.log(new Big(100).multiply(2).toString(), 'big 1');
// // console.log(new Big(100).divide(2).toString(), 'big 2');
// // console.log(new Big(5).add(5).toString(), 'big 1');
// // console.log(new Big(10).subtract(2).toString(), 'big 2');

// console.log('------');
// // console.log(6.8e-9.toFixed());
// // console.log(6.8e-9);
// // console.log(1.6e-7);
// // console.log(Big.fromNumber(6.8e-9));
// // console.log(Big.fromNumber(16e-9));
// // console.log(Big.fromNumber(1e-1) == 1e-1);
// // console.log(new Big(0).sub(1.6e-7).toString());

// // console.log(10n ** 4n);
// // console.log(new Big(10).pow(4).toString());
// // console.log(new Big(1.1).floor().toString());

// console.log(new Big(100).div(75).toString(), 100 / 75);
// console.log(new Big(100).div(75).toString(), 100 / 75);
// console.log(new Big(100).div(75).mul(99).toString(), 100 / 75 * 99);
// console.log(new Big(1).div(3).add(new Big(2).div(3)).toString(), 1 / 3 + 2 / 3);

// // console.log(new Big(1.1).ceil().toString());
// // console.log(new Big(1.01).ceil().toString());
// // console.log(new Big(1.01).ceil(1).toString());
// // console.log(new Big(1.001).ceil(1).toString());
// // console.log(new Big(1.000).ceil(1).toString());

// // console.log(new Big(1).abs().toString());
// // console.log(new Big(-1).abs().toString());

// // console.log(0.1 ** 4);
// // console.log(new Big(0.1).pow(4).toString());

// // console.log(new Big(-1).toString());
// // console.log(new Big(-0.001).toString());

// // // console.log(10.123456.toFixed(18));
// // console.log(new Big(10.123456).toString());
// // console.log(new Big(10.123456).toFixed());
// // console.log(new Big(10.123456).toFixed(0));
// // console.log(new Big(0).toFixed(2));
// // console.log(new Big(0).toString());
// // console.log(new Big(123.456789).floor(2).toString());
// // console.log(new Big(123.456789).floor(2).toString());
// // console.log(Big(0).toString());
// console.log('------');

// // console.log(new Big(10).pow(2).toString(), 'big 2');
// // console.log(new Big(10).gt(2), 'big 2');
// // console.log(new Big(10).gt(10), 'big 2');
// // console.log(new Big(10).gte(10), 'big 2');


// toString(add(sub(10, 20), 10))

// new Big(10).sub(20).add(10)
