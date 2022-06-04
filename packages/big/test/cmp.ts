
import Big from '../src/big'

describe('gt, gte, eq, lt, lte', () => {
	const t = (a, b, expected) => {
		it(`cmp(${a}, ${b}) = ${expected}`, () => {
			if (expected === 1) {
				expect(new Big(a).gt(b)).toBe(true);
				expect(new Big(a).gte(b)).toBe(true);
				expect(new Big(a).eq(b)).toBe(false);
				expect(new Big(a).lt(b)).toBe(false);
				expect(new Big(a).lte(b)).toBe(false);
			} else if (expected === -1) {
				expect(new Big(a).gt(b)).toBe(false);
				expect(new Big(a).gte(b)).toBe(false);
				expect(new Big(a).eq(b)).toBe(false);
				expect(new Big(a).lt(b)).toBe(true);
				expect(new Big(a).lte(b)).toBe(true);
			} else if (expected === 0) {
				expect(new Big(a).gt(b)).toBe(false);
				expect(new Big(a).gte(b)).toBe(true);
				expect(new Big(a).eq(b)).toBe(true);
				expect(new Big(a).lt(b)).toBe(false);
				expect(new Big(a).lte(b)).toBe(true);
			}
		})
	};

	Big.setDecimals(20);

	t(1, 0, 1);
	t(1, -0, 1);
	t(-1, 0, -1);
	t(-1, -0, -1);
	t(0, 1, -1);
	t(0, -1, 1);
	t(-0, 1, -1);
	t(-0, -1, 1);
	t(0, '0.1', -1);
	t(0, '-0.1', 1);
	t(-0, '0.1', -1);
	t(-0, '-0.1', 1);
	t('0.1', 0, 1);
	t('0.1', -0, 1);
	t('-0.1', 0, -1);
	t('-0.1', -0, -1);
	t(0, '0.000000009', -1);
	t(0, '-0.000000009', 1);
	t(-0, '0.000000009', -1);
	t(-0, '-0.000000009', 1);
	t('0.000000009', 0, 1);
	t('0.000000009', -0, 1);
	t('-0.000000009', 0, -1);
	t('-0.000000009', -0, -1);
	t(0, '5.5', -1);
	t(0, '-5.5', 1);
	t(-0, '5.5', -1);
	t(-0, '-5.5', 1);
	t('5.5', 0, 1);
	t('5.5', -0, 1);
	t('-5.5', 0, -1);
	t('-5.5', -0, -1);
	t(1, '0', 1);
	t(1, '1', 0);
	t(1, '-45', 1);
	t(1, '22', -1);
	t(1, 144, -1);
	t(1, '0144', -1);
	t(1, '6.1915', -1);
	t(1, '-1.02', 1);
	t(1, '0.09', 1);
	t(1, '-0.0001', 1);
	t(1, '8e5', -1);
	t(1, '9E12', -1);
	t(1, '1e-14', 1);
	t(1, '3.345E-9', 1);
	t(1, '-345.43e+4', 1);
	t(1, '-94.12E+0', 1);
	t('0', 0, 0);
	t('0', '0', 0);
	t(3, -0, 1);
	t(9.654, 0, 1);
	t(0, '111.1111111110000', -1);
	t(-1, 1, -1);
	t(-0.01, 0.01, -1);
	t(54, -54, 1);
	t(9.99, '-9.99', 1);
	t('0.0000023432495704937', '-0.0000023432495704937', 1);
	t(100, 100, 0);
	t(-999.99, '0.01', -1);
	t('10', 4, 1);
	t('03.333', -4, 1);
	t(-1, -0.1, -1);
	t(43534.5435, '0.054645', 1);
	t('99999', '1', 1);
	t('3e0', 4, -1);

	t(0.04, 0.079393068, -1);
	t(0.023, 0.04840192819, -1);
	t(0.021879, 0.02, 1);
});
