
import Big from '../src/big'

describe('floor', () => {
	const t = (expected, value, decimals = 0) => {
		it(`floor(${value}) = ${expected}`, () => {
			const result = new Big(value).floor(decimals).toString();
			expect(result).toBe(String(expected));
		})
	};

	Big.setDecimals(20);

	console.log(Math.floor(-1.1));

	t(0, 0);
	t(0, -0);
	t(0, 0.5);
	t(0, 0.7);
	t(1, 1);
	t(1, 1.1);
	t(1, 1.49999);
	t(-1, -0.5);
	t(-1, -0.5000000000000001);
	t(-1, -0.7);
	t(-1, -1);
	t(-1, -1.1);
	t(-1, -1.49999);
	t(-1, -1.5);
	t(-10, -10);



	// t('0', '0.000084888060736883027314038572334303632');
	// t('30845717889906383052', '30845717889906383052.56472015469740823');
	// t('76', '76.0719');
	// t('0', '-0.00686876124450101884528');
	// t('71710176', '71710176');
	// t('79', '79');
	// t('6309793381', '6309793381');
	// t('76162410487880976', '76162410487880976.81307140573688335764284');
	// t('7491318926', '7491318926.312122759153805942088431');
	// t('74909422733607112719', '74909422733607112719.13179009875');
	// t('559', '559.2110851431205');
	// t('8', '8.0606265529');
	// t('24701408591129838', '24701408591129838.22163');
	// t('826068555927524695', '826068555927524695');
	// t('0', '0.000058441452091833136219167587256');
	// t('47353089', '47353089.2019161006899898');
	// t('3103', '3103');
	// t('5620', '5620.48101861977');
	// t('9105547112', '9105547112.1319443692');
	// t('335816732794', '335816732794.51601276961965281205689254');
	// t('439059239409', '439059239409.55703238112278');
	// t('43465109466157505', '43465109466157505');
	// t('5390894520', '5390894520.8738091063016');
	// t('485669', '485669');
	// t('3', '3.284095344472285718254591781467536534546');
	// t('0', '-0.4210910538061556801483189');
	// t('3133', '3133.654494231705614');
	// t('27796900', '27796900.0685101');
	// t('736988809325', '736988809325');
	// t('577064478018279', '577064478018279');
	// t('3269018763089', '3269018763089.5711045989917554');

	// t(9007199254740990, 9007199254740990);
	// t(9007199254740991, 9007199254740991);
	// t(-9007199254740990, -9007199254740990);
	// t(-9007199254740991, -9007199254740991);

	// t(536870910, 536870910.5);
	// t(536870911, 536870911);
	// t(536870911, 536870911.4);
	// t(536870911, 536870911.5);
	// t(536870912, 536870912);
	// t(536870912, 536870912.4);
	// t(536870912, 536870912.5);
	// t(536870913, 536870913);
	// t(536870913, 536870913.4);
	// t(1073741822, 1073741822.5);
	// t(1073741823, 1073741823);
	// t(1073741823, 1073741823.4);
	// t(1073741823, 1073741823.5);
	// t(1073741824, 1073741824);
	// t(1073741824, 1073741824.4);
	// t(1073741824, 1073741824.5);
	// t(2147483646, 2147483646.5);
	// t(2147483647, 2147483647);
	// t(2147483647, 2147483647.4);
	// t(2147483647, 2147483647.5);
	// t(2147483648, 2147483648);
	// t(2147483648, 2147483648.4);
	// t(2147483648, 2147483648.5);

	// t(0, 0.4);
	// t(-0, -0.4);
	// t(-0, -0.5);
	// t(0, 0.6);
	// t(-0, -0.6);
	// t(1, 1.5);
	// t(1, 1.6);
	// t(-1, -1.6);

	// t(8640000000000000, 8640000000000000);
	// t(8640000000000001, 8640000000000001);
	// t(8640000000000002, 8640000000000002);
	// t(9007199254740990, 9007199254740990);
	// t(9007199254740991, 9007199254740991);
	// t(-8640000000000000, -8640000000000000);
	// t(-8640000000000001, -8640000000000001);
	// t(-8640000000000002, -8640000000000002);
	// t(-9007199254740990, -9007199254740990);
	// t(-9007199254740991, -9007199254740991);

	// t(0, 0.49999999999999994);
	// t(0, 0.5);
	// t(0, -0.49999999999999994);

	// t('0', '-0', 0);
	// t('0', '-0', 1);
	// t('0', '0', 10);
	// t('0', '-0', 20);
});