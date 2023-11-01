import 'preact'

declare module 'preact' {
	namespace JSX {
		interface HTMLAttributes extends HTMLAttributes<HTMLImageElement> {
			border?: string
		}

		interface HTMLAttributes extends HTMLAttributes<HTMLHtmlElement> {
			'xml:lang'?: string
			'xmlns:v'?: string
			'xmlns:o'?: string
			xmlns?: string
		}

		interface HTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
			align?: 'left' | 'right' | 'center'
			bgcolor?: string
		}

		interface HTMLAttributes extends HTMLAttributes<HTMLTableRowElement> {
			['mc:repeatable']?: boolean
			['mc:hideable']?: boolean
		}

		interface HTMLAttributes extends HTMLAttributes<HTMLSpanElement> {
			['mc:edit']?: boolean | string
		}

		interface IntrinsicElements {
			fragment: HTMLAttributes<HTMLElement> & {
				id?: string
			}
		}
	}
}
