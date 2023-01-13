import { Emoji, Raw, render } from '../src/index.js'
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

	it('should render a complete mail', () => {
		const jsx = mail({ userName: 'Jack' })
		const html = render(jsx)
		expect(html.length).toBe(13632)
	})
})
