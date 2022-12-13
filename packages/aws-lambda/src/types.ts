import { Struct, Infer } from 'superstruct'
import { Context } from 'aws-lambda'
import { Container } from './di.js'

export type OptStruct = Struct<any, unknown> | undefined
export type Input<T extends OptStruct = undefined> = T extends undefined ? unknown : Infer<RemoveUndefined<T>>
export type Output<T extends OptStruct = undefined> = T extends undefined ? unknown : Infer<RemoveUndefined<T>>
// export type Input<T extends OptStruct = undefined> = T extends Struct ? Infer<T> : unknown
// export type Output<T extends OptStruct = undefined> = T extends Struct ? Infer<T> : unknown
export type RemoveUndefined<T> = T extends undefined ? never : T

export type Request<I extends OptStruct = undefined> = {
	event: unknown
	input: Input<I>
	context?: Context
	emit: (event:string, ...args: any[]) => void
	[ key: string ]: any
} & Container

export type Response<O extends OptStruct = undefined> = Output<O> | Promise<Output<O>>
export type Next<O extends OptStruct = undefined> = () => Response<O>
export type Handler<I extends OptStruct = undefined, O extends OptStruct = undefined> = (request:Container & Request<I>, next: Next<O>) => Response<O>
export type Handlers<I extends OptStruct = undefined, O extends OptStruct = undefined> = Array<Handlers<I, O> | Handler<I, O>>
export type EventCallback<I extends OptStruct = undefined> = (request: Container & Request<I>, ...args: any[]) => void
export type EventListener<I extends OptStruct = undefined> = { event: string, callback: EventCallback<I> }
