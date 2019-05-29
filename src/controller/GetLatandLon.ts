// tslint:disable
const http = require("http");

interface GeoResponse {
// ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
}


// learnt from: https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
export const latAndLon = (address: string): Promise<any> => {
    const httpStr = "" // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    const urlRequest = "" // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    return new Promise ((resolve, reject) => {
        http.get(urlRequest, (resp: any) => {
            let data= "";
            resp.on('data', (chunk: any) => {
    // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
            });
            resp.on('end', () => {
                if (resp.statusCode !== 200) {
                    reject(JSON.parse(data));
                }
                resolve(JSON.parse(data));
            });
        }).on("error", (err: any) => {
            reject(err);
        });
    })
}
