// tslint:disable
const http = require("http");

interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}



// https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
export const latAndLon = (address: any): Promise<any> => {
    const httpStr = 'http://cs310.ugrad.cs.ubc.ca:11316/api/v1/project_b0o2b_m4j2b/';
    // const urlAddress = address.split(" ").join("%20");
    const urlAddress2 = encodeURIComponent(address);
    const urlRequest = httpStr + urlAddress2;
    return new Promise ((resolve, reject) => {
        http.get(urlRequest, (resp: any) => {
            let data= "";
            resp.on('data', (chunk: any) => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on("error", (err: any) => {
            console.log(err);
            reject(err);
        });
    })
}
