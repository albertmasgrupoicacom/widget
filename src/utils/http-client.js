export class HttpClient {

    async get(url){
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          //'Authorization': 'Basic Y3VzdG9tZXI6eUkyc0ZxRnh0UkxKNVZOUWVYRnpmMXA4R1dNTDZZ'
        });
        let response = await fetch(url, {method: 'GET', headers: headers});
        let result = await response.json();
        return result;
    }

    async post(url, params){
        let body = '';
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          //'Authorization': 'Basic Y3VzdG9tZXI6eUkyc0ZxRnh0UkxKNVZOUWVYRnpmMXA4R1dNTDZZ'
        });
        Object.entries(params).forEach(([key, value], index) => {body += `${index != 0 ? '&' : ''}${encodeURIComponent(key)}=${encodeURIComponent(value)}`});
        let response = await fetch(url, {method: 'POST', headers: headers, body: body});
        let result = await response.json();
        return result;
    }

}