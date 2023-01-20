import { Emoji, Raw, Image, render } from '../src/index.js'
import mail from './data/mail.js'

describe('Build Jsx', () => {
	it('should render an Emjoi components', () => {
		const jsx = Emoji({ children: '😀', fontSize: '1em' })
		const html = render(jsx)
		expect(html).toBe('<span style="font-size: 1em;">😀</span>')
	})

	it('should render Raw components', () => {
		const jsx = Raw({ html: '<!DOCTYPE html>' })
		const html = render(jsx)
		expect(html).toBe('<!DOCTYPE html>')
	})

	it('should render Raw components', () => {
		const jsx = Image({ href: '/', src: 'img.png', alt: 'Image', width: 50, height: 50 })
		const html = render(jsx)
		expect(html).toBe(
			'<tr><td><a href="/" target="_blank" title="Image" style="display: block; width: 50px; height: 50px;"><img src="img.png" alt="Image" width="50" height="50" border="0" style="display: block; border: none; margin: 0px; width: 50px; height: 50px; max-width: 50px; max-height: 50px; min-width: 50px; min-height: 50px;" /></a></td></tr>'
		)
	})

	it('should render a complete mail', () => {
		const jsx = mail({ userName: 'Jack' })
		const html = render(jsx)
		expect(html.length).toBe(13613)
	})
})
