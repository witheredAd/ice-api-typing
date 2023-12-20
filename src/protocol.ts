import axios, {type AxiosResponse} from "axios"

export function generateGet<T = any>(backend: string, path: string, data?: object) {
    return axios({
        url: backend + path,
        params: data
    }) as Promise<AxiosResponse<T>>
}

export function generatePost<T = any>(backend: string, path: string, data?: object) {
    return axios.post(backend + path, data,
        {headers: {'Content-Type': 'application/json'}}) as Promise<AxiosResponse<T>>
}