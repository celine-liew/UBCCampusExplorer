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
          /** code removed to adhere to collaboration policy */
        };
           /** code removed to adhere to collaboration policy */
    });
};
