
import { rollup, RollupOptions } from './rollup/index'

export const bundle = async (input, options:RollupOptions = {}) => {
	return rollup(input, options)
}
