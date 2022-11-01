
import coffee from 'coffeescript';

coffee.register();

export default function VitePluginCoffee() {
	return {
		name: '@heat/vite-plugin-coffee',
		transform: async (src, id) => {
			if (/\.coffee$/.test(id)) {
				const { js, sourceMap } = coffee.compile(src, {
					sourceMap: true,
				});

				return {
					code: js,
					map: sourceMap
				};
			}
		}
	};
}
