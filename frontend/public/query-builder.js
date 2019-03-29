/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 * 1) Find some elements of interest in the page. JS has some methods to help with this (examples).
 * 2) Identify which of those elements are checked/selected.
 * 3) Represent that as part of your query object.
 * @returns query object adhering to the query EBNF
 */

CampusExplorer.buildQuery = function() {
       /** code removed to adhere to collaboration policy */
    return query;
};

function buildQueryTRANSFORM(applyArrayToAdd, arrayForGroup, query) {
       /** code removed to adhere to collaboration policy */
}

function buildAPPLYarray(formToBuild, idString) {
       /** code removed to adhere to collaboration policy */
}

function buildGroupArray(formToBuild, idString) {
       /** code removed to adhere to collaboration policy */
}

function buildQueryOPTIONS(formToBuild, idString, query) {
     /** code removed to adhere to collaboration policy */
}

function buildQueryWHERE(IsLtGtEQ, mOrSKey, formToBuild, idString, query) {
       /** code removed to adhere to collaboration policy */
}

function getWhereObjectContent(allOrNot, arrayToAddtoWhere) {
      /** code removed to adhere to collaboration policy */
}

function getColumnANDOrderInOptions(formToBuild, idString) {
       /** code removed to adhere to collaboration policy */
}

function convertArrayToObject(arrayconvert) {
    return arrayconvert.reduce((a, b) => Object.assign(a, b), {});
}

function getAllOrNotFirstCondition(formToBuild, keysForWhere) {
      /** code removed to adhere to collaboration policy */
    return "";
}


function getKeysForWhereFunction(formToBuild, IsLtGtEQ, mOrSKey, idString) {
       /** code removed to adhere to collaboration policy */
    return { keysForWhere, arrayToAddtoWhere, IsLtGtEQ, mOrSKey };
}

function idStringCoursesOrRooms(idString, COURSES, formToBuild, ROOMS) {
       /** code removed to adhere to collaboration policy */
    return { idString, formToBuild };
}


