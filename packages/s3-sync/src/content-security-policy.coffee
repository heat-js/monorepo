
NONE = "'none'"
SELF = "'self'"
UNSAFE_INLINE = "'unsafe-inline'"

export default {

	defaultSrc: NONE

	scriptSrc: [
		SELF
		'www.google.com'
		'www.gstatic.com'
		'www.google-analytics.com'
		'www.googletagmanager.com'
		'www.googleadservices.com'
		'googleads.g.doubleclick.net'
		'connect.facebook.net'
	]

	styleSrc: [
		SELF
		UNSAFE_INLINE
		'www.gstatic.com'
	]

	imgSrc: 	[ 'https:', 'data:' ]
	fontSrc:	[ SELF, 'fonts.gstatic.com' ]
	connectSrc:	[
		SELF
		'api.${ssm:domain}'
		'api.giphy.com'
		'cognito-idp.eu-west-1.amazonaws.com'
		'wss://*.iot.eu-west-1.amazonaws.com:*'
		'www.google.com'
		'sessions.bugsnag.com'
		'notify.bugsnag.com'
	]

	frameSrc:		NONE
	frameAncestors: SELF
	manifestSrc:	SELF
	mediaSrc:		SELF
	baseUri:		SELF
	reportUri:		'https://jacksclub.report-uri.com/r/d/csp/enforce'
	reportTo:		'default'

	upgradeInsecureRequests: 	true
	blockAllMixedContent:		true
}
