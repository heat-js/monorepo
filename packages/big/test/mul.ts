
import Big from '../src/big'

describe('mul', () => {
	const t = (multiplicand, multiplier, expected) => {
		// const e = new Big(expected).toString()
		it(`${multiplicand} * ${multiplier} = ${expected}`, () => {
			const result = new Big(multiplicand).mul(multiplier).toString();
			expect(result).toBe(String(expected));
		})
	};

	Big.setDecimals(20);

	t(1, '1','1');
	t(1, '-45', '-45');
	t(1, '22', '22');
	t(1, 144, '144');
	t(1, '0144', '144');
	t(1, '6.1915', '6.1915');
	t(1, '-1.02', '-1.02');
	t(1, '0.09', '0.09');
	t(1, '-0.0001', '-0.0001');
	t(1, '8e5', '800000');
	t(1, '9E12', '9000000000000');
	t(1, '-345.43e+4', '-3454300');
	t(1, '-94.12E+0', '-94.12');
	t('0', 0, '0');
	t('0', '0', '0');
	t(3, -0, '0');
	t(9.654, 0, '0');
	t(0, '0.001', '0');
	t(0, '111.1111111110000', '0');
	t(-1, 1, '-1');
	t(-0.01, 0.01, '-0.0001');
	t(54, -54, '-2916');
	t(9.99, '-9.99', '-99.8001');
	t(100, 100, '10000');
	t(-999.99, '0.01', '-9.9999');
	t('03.333', -4, '-13.332');
	t(-1, -0.1, '0.1');
	t(43534.5435, '0.054645', '2378.9451295575');
	t('99999', '1', '99999');
	t(1, 1, 1);
	t(1, -1, -1);
	t(-1, 1, -1);
	t(2, 2, 4);
	t(2, -2, -4);
	t(-2, 2, -4);
	t(-3, -3, 9);

	t('-3.6', '-3336', '12009.6');
	t('0.000000219', '-110.42', '-0.00002418198');
	t('312', '22.87694', '7137.60528');
	t('0.29976', '-5', '-1.4988');
	t('0.00000000000000000010018', '-74.6', '-0.00000000000000000746');
	t('138.583905', '9.73380', '1348.948014489');
	t('5360260.6', '-12.12', '-64966358.472');
	t('-7.01', '-0.0000000988077', '0.000000692641977');
	t('0.0000202', '-56583117802', '-1142978.9796004');
	t('116727.96', '0.0000000000000019308', '0.00000000022537834516');
	t('-136636.46', '6.5636554051', '-896834.639212729946');
	t('12.1712598149', '53.270389', '648.3677449597909961');
	t('76', '76019.61784', '5777490.95584');
	t('0.0000714939', '1425786', '101.9350017054');
	t('-3221.71685', '-230', '740994.8755');
	t('0.00000000237457904', '-892315', '-0.0021188724960776');
	t('6511.4', '0.0000000000000186', '0.00000000012111204');
});
