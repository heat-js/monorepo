# @heat/step-functions-local

**A wrapper around Amazon's StepFunctions Local to start and stop it from Node.js.**

[![version](https://img.shields.io/npm/v/@heat/step-functions-local.svg?style=flat-square)](https://www.npmjs.com/package/@heat/step-functions-local)

This module wraps Amazon's
[StepFunctions Local](https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local.html).
It just exposes one method called `spawn()` which does not much more than calling
[`child_process.spawn()`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
and returning it's result.

```js
const stepFunctionsLocalProcess = dynamoDbLocal.spawn();
// ...
stepFunctionsLocalProcess.kill();
```

A property the options object could have is port. It specifies the port number that the
process will run on. In absence of the port property, 8083 is used as the port number.

```js
const port = 8083;
const stepFunctionsLocalProcess = stepFunctionsLocal.spawn(port);
// ...
stepFunctionsLocalProcess.kill();
```
