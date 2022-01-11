
import { into } from 'draftlog'
import symbols	from 'log-symbols'
import spinners	from 'cli-spinners'
import chalk	from 'chalk'

into console
	.addLineListener process.stdin

class ConsoleLine

	constructor: ->
		@draft = console.draft()

	update: (text) ->
		@draft text

class Task extends ConsoleLine

	icon:		symbols.success
	index:		0
	spinner:	spinners.dots
	finished:	false

	constructor: ->
		super()
		@metadata = {}

	warning:	-> @icon = symbols.warning
	success:	-> @icon = symbols.success
	error:		-> @icon = symbols.error
	info:		-> @icon = symbols.info

	done: ->
		@finished = true
		@updateFormattedText()

	setName: (@name) ->
	setPrefix: (@prefix) ->
	setContent: (@content) ->

	addMetadata: (key, value) ->
		@metadata[ key ] = value

	updateFormattedText: ->
		icon = @icon
		if not @finished
			icon = @spinner.frames[ @index++ % @spinner.frames.length ]
			icon = chalk"{blue #{ icon }}"

		text = [ icon ]
		if @prefix
			text.push @prefix

		if @name
			name = @name
				.padEnd 50
				.substr 0, 50

			if @finished
				text.push chalk"{dim.yellow #{ name }}"
			else
				text.push chalk"{yellow #{ name }}"

		if @content
			text.push @content

		metadata = Object.entries @metadata
		if metadata.length
			text.push "(#{ metadata
				.map ([ key, value ]) ->
					return chalk"{dim #{ key }}: {blue #{value}}"
				.join ', '
			})"

		@update text.join ' '



run = (callback) ->

	task = new Task
	interval = setInterval ->
		task.updateFormattedText()
	, task.spinner.interval

	try
		await callback task

	catch error
		task.setContent chalk.red error.message
		task.error()
		# throw error

	finally
		clearInterval interval
		task.done()


# task = (name, callback) ->

# 	if typeof name is 'string'
# 		name = name.padEnd 50
# 	else
# 		callback = name
# 		name = ''

# 	task = new Task

# 	index 	= 0
# 	icon	= symbols.success
# 	length	= spinners.dots.frames.length
# 	line	= new ConsoleLine
# 	content = ''
# 	update 	= ->
# 		spinner = spinners.dots.frames[ index++ % length ]
# 		line.update chalk"{blue #{ spinner }} {yellow #{name}} #{ content }"

# 	interval = setInterval update, spinners.dots.interval

# 	try
# 		await callback (_content) ->
# 			content = _content
# 			update()

# 	catch error
# 		throw error

# 	finally
# 		clearInterval interval
# 		line.update chalk"#{ icon } {dim.yellow #{name}} #{ content }"




( ->
	run (task) ->
		task.setContent "Validate templates..."
		await new Promise (resolve) ->
			setTimeout resolve, 4000
		# task.setContent "Done Validate templates"

	run (task) ->
		task.setPrefix 'Lambda:'
		task.setName 'contest__contest-get.zip'
		task.setContent "Uploading Lambda..."
		await new Promise (resolve) ->
			setTimeout resolve, 3000
		task.setContent "Upload Lambda Done"
		task.addMetadata 'Build', '13.03s'
		task.addMetadata 'Size', '248.87 KB'

	run (task) ->
		task.setPrefix 'Lambda:'
		task.setName 'contest__contest-progress-list.zip'
		task.setContent "Uploading Lambda 2"
		await new Promise (resolve) ->
			setTimeout resolve, 2000
		task.setContent "Upload Done"
		throw new Error 'Some random error'

	run (task) ->
		task.setPrefix 'Lambda:'
		task.setName 'contest__contest-get.zip'
		task.setContent "Uploading Lambda 3"
		await new Promise (resolve) ->
			setTimeout resolve, 1000
		task.setContent "Upload Done"
		task.warning()

	result = await run (task) ->
		task.setPrefix 'Lambda:'
		task.setName 'contest__contest-get.zip'
		task.setContent "Uploading Lambda 3"
		await new Promise (resolve) ->
			setTimeout resolve, 5000
		task.setContent "Upload Done"
		task.info()

		return 'Done!'

	console.log result
	# await new Promise (resolve) ->
	# 	setTimeout resolve, 5000

	process.exit 0
)()




# # class ConsoleLineProcess extends ConsoleLine

# # 	@PENDING: 0
# # 	@COMPLETED: 1
# # 	@FAILED: 2

# # 	promise: (text, promise) ->
# # 		@draft text

# # 	done: ->

# line = new ConsoleLineProcess
# index = 0
# setInterval ->
# 	line.update ++index
# , 1000


# var draft = console.draft()
# var elapsed = 1
# setInterval( () => {
#   draft('Elapsed', elapsed++, 'seconds')
# }, 1000)

# console.log('It doesn`t matter')
# console.log('How \n many \n lines \n it uses')
