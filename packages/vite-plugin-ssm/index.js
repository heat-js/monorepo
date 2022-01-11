
import AWS from 'aws-sdk';
import parameterStore from 'aws-param-store';

const getCode = (params) => {
	return params.map(({ key, value }) => {
		return `export const ${key} = ${JSON.stringify(value)};`
	}).join('\n');
};

export default function VitePluginSsm({ profile, region = 'eu-west-1' } = {}) {
	return {
		name: 'vite-plugin-ssm',
		transform: async (src, id) => {
			if (/\.ssm$/.test(id)) {
				const parameters = JSON.parse(src);
				const keys = Object.keys(parameters);
				const values = Object.values(parameters);
				const credentials = new AWS.SharedIniFileCredentials({
					profile
				});

				const result = await parameterStore.getParameters(values, {
					credentials,
					region
				});

				const list = result.Parameters.map(({ Name, Value }) => {
					return {
						key: keys[values.indexOf(Name)],
						value: Value
					}
				});

				return getCode(list);
			}
		}
	};
}
