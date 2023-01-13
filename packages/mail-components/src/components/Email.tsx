
import { Fragment } from 'preact'
import { formatThemeProperty } from '../helpers.js'
import Mso from './Mso'
import Raw from './Raw'
import Style from './Style'

export default ({ lang = 'en', title, darkMode, bgColor = ['#ffffff', '#0c1018'], children }) => {

	const [id, color] = formatThemeProperty('background-color', bgColor);

	return (
		<Fragment>
			<Raw html='<!DOCTYPE html>' />
			<html xml:lang={lang} lang={lang} xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
				<head>
					<title>{title}</title>

					<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta name="x-apple-disable-message-reformatting" />
					<meta name="format-detection" content="telephone=no, address=no" />

					{darkMode && (
						<Fragment>
							<meta name='color-scheme' content='dark light' />
							<meta name='supported-color-schemes' content='dark light only' />

							<Style value={`
								:root {
									color-scheme: dark light;
									supported-color-schemes: dark light;
								}
							`} />

							<Style value='
								@media(prefers-color-scheme: dark) {
									.dark {
										display: block !important;
										width: auto !important;
										overflow: visible !important;
										float: none !important;
										max-height: inherit !important;
										max-width: inherit !important;
										line-height: auto !important;
										margin-top: 0px !important;
										visibility: inherit !important;
									}

									.light {
										display: none;
										display: none !important;
									}
								}
							' />

							<fragment id='color-scheme' />
						</Fragment>
					)}

					<Mso if='gte mso 9'>
						<Raw html='<xml><o:OfficeDocumentSettings><o:AllowPNG></o:AllowPNG><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>' />
					</Mso>

					<Mso if='(mso 16)'>
						<Style value='a { text-decoration: none; }' />
					</Mso>

					<Style value='
						/* CLIENT-SPECIFIC STYLES */
						body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; word-spacing: normal; }
						table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
						img { -ms-interpolation-mode: bicubic; }

						/* RESET STYLES */
						img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
						table { border-collapse: collapse !important; }
						body { height: 100% !important; margin: 0 auto !important; padding: 0 !important; width: 100% !important; }

						/* iOS BLUE LINKS */
						a[x-apple-data-detectors] {
							color: inherit !important;
							text-decoration: none !important;
							font-size: inherit !important;
							font-family: inherit !important;
							font-weight: inherit !important;
							line-height: inherit !important;
						}

						/* ANDROID CENTER FIX */
						div[style*="margin: 16px 0;"] { margin: 0 !important; }
					' />
				</head>
				<body spellcheck='false' class={id} style={{
					backgroundColor: color,
					margin: '0 !important',
					padding: '0 !important',
				}}>
					{children}
				</body>
			</html>
		</Fragment>
	)
}
