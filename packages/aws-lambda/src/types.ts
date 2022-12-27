import { Struct, Infer } from '@heat/validate'
import { Context as LambdaContext } from 'aws-lambda'

export type OptStruct = Struct<any, unknown> | undefined
export type Input<T extends OptStruct = undefined> = T extends undefined ? unknown : Infer<RemoveUndefined<T>>
export type Output<T extends OptStruct = undefined> = T extends undefined ? unknown : Infer<RemoveUndefined<T>>
// export type Input<T extends OptStruct = undefined> = T extends Struct ? Infer<T> : unknown
// export type Output<T extends OptStruct = undefined> = T extends Struct ? Infer<T> : unknown
export type RemoveUndefined<T> = T extends undefined ? never : T

// export type Request<I extends OptStruct = undefined> = {
// readonly event: unknown
// readonly input: Input<I>
// readonly context?: Context
// readonly log: Logger
// }

export type Context = LambdaContext & {
	readonly event: unknown
	readonly log: Logger
}

// import { Context } from 'aws-lambda'

export type Response<O extends OptStruct = undefined> = Output<O> | Promise<Output<O>>
// export type Next<O extends OptStruct = any> = () => Response<O>

export type Handler<I extends OptStruct = undefined, O extends OptStruct = undefined> = (
	event: Input<I>,
	context: Context
) => Response<O>

// export type Handlers<I extends OptStruct = undefined, O extends OptStruct = undefined> =
// | Array<Handler<I, O>>
// | Handler<I, O>

// export type EventCallback<I extends OptStruct = undefined> = (request: Request<I>, ...args: any[]) => void
// export type EventListener<I extends OptStruct = undefined> = { event: string, callback: EventCallback<I> }

export type Logger = (error: any, metaData?: ExtraMetaData) => Promise<void>
export type Loggers = Array<Logger | Loggers> | Logger
export type ExtraMetaData = Record<string, Record<string, any>>
