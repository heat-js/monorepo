import renderTo from 'preact-render-to-string'

export const render = (jsx: any) => {
	ids = 0
	styles = []
	map = {}

	return renderTo(jsx)
		.replaceAll('<fragment id="color-scheme"></fragment>', getColorScheme())
		.replaceAll('<fragment>', '')
		.replaceAll('</fragment>', '')
}

export const formatStyleNumber = (value: string | number) => {
	if (typeof value === 'undefined') return undefined

	const str = String(value)
	const last = str[str.length - 1]

	if (last === '%') return str
	if (!isNaN(value)) return str + 'px'

	return str
}

export const formatAttributeNumber = (value: string | number) => {
	if (typeof value === 'undefined') return undefined

	const str = String(value)
	const last = str[str.length - 1]

	if (last === '%') return str

	return parseFloat(str)
}

export const combineClasses = (...args: string[]) => {
	return args.filter(c => !!c).join(' ')
}

// ---------------------

let ids = 0
let styles = []
let map = {}

export const addStyle = (property: string, value: string) => {
	const key = `${property}${value}`
	if (map[key]) return map[key]

	const id = `a${ids++}`
	styles.push({ id, property, value })

	map[key] = id
	return id
}

export const formatThemeProperty = (property: string, value: string | string[]) => {
	if (typeof value === 'undefined') return [undefined, undefined]

	if (Array.isArray(value)) {
		return [addStyle(property, value[1]), value[0]]
	}

	return [undefined, value]
}

const getColorScheme = () => {
	if (styles.length === 0) return ''

	return `
		<style type="text/css">
			@media(prefers-color-scheme: dark) {
				${styles.map(({ id, property, value }) => `.${id}{${property}:${value}!important;}`).join(' ')}
			}
		</style>
	`.replace(/[\t\n\r]+/gm, '')
}
