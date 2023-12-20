import {generatePost, generateGet} from "./protocol";
import {type AxiosResponse} from "axios";
import type {
    ConstructorToTsType,
    ExtractTerminalProtocol,
    ExtractUrls,
    ProtocolDefine,
    TerminalProtocol
} from "./utils/define_helper";
import {ProtocolDefinitionHelper, ProtocolNamedDefinitionHelper} from "./utils/define_helper";



export function defineProtocols<T extends ProtocolDefine, U extends ExtractUrls<T> = ExtractUrls<T>>(protocol: T): T {
    return protocol
}


export function defineNamedProtocol<N extends string,
    T extends ProtocolDefine | TerminalProtocol = {}>(
    name: N, protocol?: T): ProtocolNamedDefinitionHelper<T,N> {
    if (protocol === undefined) {
        protocol = {} as T
    }
    return new ProtocolNamedDefinitionHelper(protocol, name) as ProtocolNamedDefinitionHelper<T, N>
}
export function defineRootProtocol() {
    return new ProtocolDefinitionHelper({})
}

export function defineProtocolCaller<T extends ProtocolDefinitionHelper<any>>(protocolsHelper: T, backend_url: string) {
    const protocols: T extends ProtocolDefinitionHelper<infer IN> ? IN : never
        = protocolsHelper.protocol_definition

    function extractTerminalProtocol<
        U extends ExtractUrls<typeof protocols> = ExtractUrls<typeof protocols>,
        R extends {request:any, result:any, type:'POST'|'GET'} = ExtractTerminalProtocol<typeof protocols, U>
    >(url: U): R {
        const arr = url.split("/")
        arr.pop()
        let obj: ProtocolDefine | TerminalProtocol = protocols
        for(const path of arr) {
            obj = (obj as ProtocolDefine)[path]
        }
        return obj as R
    }

    function getESTypeNameFromConstructor(ctor: any)
        : "undefined" | "object" | "boolean" | "number" | "string"  {
        if (ctor === Number) {
            return "number"
        } else if (ctor === String) {
            return "string"
        } else if (ctor === Boolean) {
            return "boolean"
        } else if (ctor === Object) {
            return "object"
        }
        return "undefined"
    }

    function checkType(data: any, constrain: any, name: string) {
        for (const key in data) {
            if (constrain[key] === undefined) {
                console.warn(`[api-typing] Property '${key}' given is not defined (checking interface '${name}')`)
            } else if (
                constrain[key] === Number ||
                constrain[key] === String ||
                constrain[key] === Boolean ||
                constrain[key] === Object) {
                const expect_type = getESTypeNameFromConstructor(constrain[key]);
                if (expect_type != typeof data[key]) {
                    console.error(
                        `[api-typing] Property '${key}' is given ${typeof data[key]}, but defined ${expect_type} (checking interface '${name}')`)
                }
            } else {
                checkType(data[key], constrain[key], name)
            }
        }
    }

    const doProtocol = <
        U extends ExtractUrls<typeof protocols> = ExtractUrls<typeof protocols>,
        R extends {request:any, result:any, type:'POST'|'GET'} = ExtractTerminalProtocol<typeof protocols, U>
    >(
        url: U, data: ConstructorToTsType<R["request"]>
    ):  Promise<AxiosResponse<ConstructorToTsType<R["result"]>>> => {
        const t_p = extractTerminalProtocol(url)
        let pack;
        if (t_p.type == 'POST') {
            pack = generatePost(backend_url, url, data)
        } else {
            pack = generateGet(backend_url, url, data)
        }
        return pack.then((res) => {
            checkType(res.data, t_p.result, url);
            return res
        })
    }

    return doProtocol;
}


