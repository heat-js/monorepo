declare module 'svgstore' {
	type Options = {
		cleanDefs?: boolean
		cleanSymbols?: boolean
		inline?: boolean
		svgAttrs?: boolean
		symbolAttrs?: boolean
		copyAttrs?: boolean
		renameDefs?: boolean
	}

	function svgstore(options?: Options): {
		add(id: string, file: string, options?: Options): void
		toString(options?: Options): string
	}

	export = svgstore
}
