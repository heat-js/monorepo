import renderTo from 'preact-render-to-string'
import preact from 'preact'

export const render = (jsx: preact.JSX.Element) => {
	ids = 0
	styles = []
	map = {}

	return renderTo(jsx)
		.replaceAll('<fragment id="color-scheme"></fragment>', getColorScheme())
		.replaceAll('<fragment>', '')
		.replaceAll('</fragment>', '')
}

export const formatStyleNumber = (value: string | number | undefined) => {
	if (typeof value === 'string') {
		const last = value[value.length - 1]
		if (last === '%') return value
		if (!isNaN(Number(value))) return value + 'px'
		return value
	}

	return value
}

export const formatAttributeNumber = (value: string | number | undefined) => {
	if (typeof value === 'undefined') return undefined

	const str = String(value)
	const last = str[str.length - 1]

	if (last === '%') return str

	return parseFloat(str)
}

export const combineClasses = (...args: (string | undefined)[]) => {
	return args.filter(c => !!c).join(' ')
}

// ---------------------

let ids = 0
let styles: { id: string; property: string; value: string }[] = []
let map: Record<string, string> = {}

export const addStyle = (property: string, value: string) => {
	const key = `${property}${value}`
	if (map[key]) return map[key]

	const id = `a${ids++}`
	styles.push({ id, property, value })

	map[key] = id
	return id
}

export const formatThemeProperty = (
	property: string,
	value: [string, string] | string | undefined
) => {
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
