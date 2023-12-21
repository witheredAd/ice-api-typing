import {defineProtocolCaller} from "../core";
import {type AxiosResponse} from "axios";
export {type AxiosResponse} from 'axios'

export type TerminalProtocol = {
    result: any,
    request: any,
    type: 'POST' | 'GET'
}

export type ProtocolDefine = {
    [url: string]: ProtocolDefine | TerminalProtocol
}


export type UnionAdd<U extends string, T extends string> =
    `${U}/${T}`

export type ExtractObjValue<O> =
    O[keyof O]

export type ExtractUrls<T extends ProtocolDefine | TerminalProtocol> =
    T extends ProtocolDefine ?
        ExtractObjValue<{
            [K in keyof T]: K extends string ?
                UnionAdd<K, ExtractUrls<T[K]>>
                : 'NOTHING'
        }>
        : ''

export type ExtractUrlOfPredicate<T extends ProtocolDefine | TerminalProtocol, P> =
    T extends ProtocolDefine ?
        ExtractObjValue<{
            [K in keyof T]: K extends string ?
                UnionAdd<K, ExtractUrlOfPredicate<T[K], P>>
                : 'NOTHING'
        }>
        : T extends P ? '' : never

export type ExtractGETUrls<T extends ProtocolDefine | TerminalProtocol> =
    ExtractUrlOfPredicate<T, {type: 'GET'}>

export type ExtractPOSTUrls<T extends ProtocolDefine | TerminalProtocol> =
    ExtractUrlOfPredicate<T, {type: 'POST'}>

export type ExtractTerminalProtocol<T extends ProtocolDefine | TerminalProtocol, Url extends string> =
    T extends ProtocolDefine ?
        Url extends `${infer D}/${infer E}` ?
            ExtractTerminalProtocol<T[D], E> : never
        : T

export type ConstructorToTsType<T> = {
    [K in keyof T]:
    T[K] extends NumberConstructor ? number
        : T[K] extends StringConstructor ? string
            : T[K] extends BooleanConstructor ? boolean
                : T[K] extends ArrayConstructor ? Array<any>
                    : T[K] extends ObjectConstructor ? object
                        : T[K] extends DateConstructor ? InstanceType<typeof Date>
                            : T[K] extends {new: () => infer U} ? U
                                : T[K] extends Array<infer I> ? I
                                    : ConstructorToTsType<T[K]>
}


export class ProtocolDefinitionHelper<T extends ProtocolDefine | TerminalProtocol> {
    protocol_definition: T;
    constructor(p_d: T) {
        this.protocol_definition = p_d
    }

    combineWith<
        U extends ProtocolDefinitionHelper<any>,
        R extends ProtocolDefinitionHelper<any>
            = U extends ProtocolDefinitionHelper<infer V> ? ProtocolDefinitionHelper<T & V> : never
    >(x: U): R {
        return new ProtocolDefinitionHelper(
            {...this.protocol_definition, ...x.protocol_definition}
        ) as
            R
    }

    caller(backend_url: string): (<
        U extends ExtractUrls<T> = ExtractUrls<T>,
        R extends {request:any, result:any, type:'POST'|'GET'} = ExtractTerminalProtocol<T, U>
    >(
        url: U, data: ConstructorToTsType<R["request"]>
    ) =>  Promise<AxiosResponse<ConstructorToTsType<R["result"]>>>) {
        return defineProtocolCaller<ProtocolDefinitionHelper<T>>(this, backend_url)
    }
}


export class ProtocolNamedDefinitionHelper<T extends ProtocolDefine | TerminalProtocol, N extends string>
    extends ProtocolDefinitionHelper<{[K in N]: T}>{
    name: N;
    constructor(p_d: T, name: N) {
        super({[name]: p_d} as {[K in N]: T});
        this.name = name
    }

    insert<
        U extends ProtocolDefinitionHelper<any>,
        R extends ProtocolDefinitionHelper<any>
            = U extends ProtocolDefinitionHelper<infer V> ?
            ProtocolNamedDefinitionHelper<T & V, N> : never
    >(x: U): R
    {
        return new ProtocolNamedDefinitionHelper(
            {...this.protocol_definition[this.name], ...x.protocol_definition} as
                U extends ProtocolDefinitionHelper<infer V> ?
                    T & V : never,
            this.name
        ) as unknown as R
    }
}