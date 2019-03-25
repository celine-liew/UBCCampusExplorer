/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 * You must use the browser-native XMLHttpRequest object and its send and onload methods to send requests
 * because otherwise the Autobot tests will fail.
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */ https://javascript.info/xmlhttprequest#events-onload-onerror-etc
CampusExplorer.sendQuery = function(query) {
    return new Promise(function(fulfill, reject) {
        const ajaxReq = new XMLHttpRequest();
        ajaxReq.onload = function() {
            if (ajaxReq.status != 200) {
                reject(JSON.parse(ajaxReq.responseText)); //e.g. 404 Not Found
            }
            else {
                fulfill(JSON.parse(ajaxReq.responseText));
            }
        };
        ajaxReq.open('POST', '/query'); // TODO to confirm what is the link to post to.
        ajaxReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        ajaxReq.send(JSON.stringify(query));
    });
};
