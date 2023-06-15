import { httpHeaders } from "../environments/environment.prod";

export class HttpClient {

    async get(url){
        let response = await fetch(url, {method: 'GET', headers: httpHeaders});
        let result = await response.json();
        return result;
    }

    async post(url, params){
        let body = '';
        Object.entries(params).forEach(([key, value]) => {
            if(value){
                let pair = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                body += body == '' ? pair : `&${pair}`;
            }
        });
        let response = await fetch(url, {method: 'POST', headers: httpHeaders, body: body});
        let result = await response.json();
        return result;
    }

}