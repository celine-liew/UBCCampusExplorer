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
    let query = {};
    let formToBuild = document.forms;
    //courseOrRoomQuery
    let idString = "";
    const COURSES = "courses";
    const ROOMS = "rooms";
    let IsLtGtEQ = "";
    let mOrSKey = "";

    ({ idString, formToBuild } = idStringCoursesOrRooms(idString, COURSES, formToBuild, ROOMS));

    let keysForWhere;
    let arrayToAddtoWhere;
    ({ keysForWhere, arrayToAddtoWhere, IsLtGtEQ, mOrSKey } = getWhereBodyObjects(formToBuild, IsLtGtEQ, mOrSKey, idString));

    getAllOrNotFirstCondition(formToBuild, keysForWhere);
    // TODO:if allOrNot not empty string, add to arrayToAddtoWhere. TODO
    // WHERE BODY:
    let objectToAddtoWhere = convertArrayToObject(arrayToAddtoWhere);
    query["WHERE"] = objectToAddtoWhere;

    // parseOptionsNow
    let arraytoAddtoColumns = [];
    const fieldsForCOLUMNS = formToBuild.querySelectorAll("div[class = 'form-group columns'] input[checked= 'checked']");
    for (let i = 0; i < fieldsForCOLUMNS.length; i++){
        const keyForColumn = idString + '_' + fieldsForCOLUMNS[i].value;
        arraytoAddtoColumns.push(keyForColumn);
    }
    // query["COLUMNS"] = arraytoAddtoColumns;
    // console.log(query);

    //parseOrder
    // let OrderObject = {};
    let ORDER = [];
    const fieldsForOrder = formToBuild.querySelectorAll("div[class = 'form-group order'] option[selected= 'selected']");
    for (let i = 0; i < fieldsForOrder.length; i++){
        const keyForOrder = idString + '_' + fieldsForOrder[i].value;
        ORDER.push(keyForOrder);
        console.log(ORDER);
    }
    let OptionsObject = {}
    if (ORDER.length == 1){
        OptionsObject = {
            "COLUMNS": arraytoAddtoColumns,
            "ORDER": ORDER[0]
        }
    } else {
        OptionsObject = {
            "COLUMNS": arraytoAddtoColumns,
            "ORDER": ORDER
        }
    }
    console.log(OptionsObject);
    query.OPTIONS = OptionsObject;
    console.log(query);

    // // TODO: implement
    // console.log("CampusExplorer.buildQuery not implemented yet.");
    return query;
}


function convertArrayToObject(arrayconvert) {
    return arrayconvert.reduce((a, b) => Object.assign(a, b), {});
}

function getAllOrNotFirstCondition(formToBuild, keysForWhere) {
    const conditionsChecked = formToBuild.querySelectorAll('input[name= "conditionType"]');
    let allOrNot = "";
    const ALL = 'all';
    const OR = 'any';
    const NOT = 'none';
    if (conditionsChecked[0].checked) {
        const allOrNotValue = conditionsChecked[0].value;
        switch (allOrNotValue) {
            case ALL:
                if (keysForWhere.length <= 1) {
                    allOrNot = "";
                }
                else {
                    allOrNot = 'AND';
                }
                break;
            case OR:
                allOrNot = 'OR';
                break;
            case NOT:
                allOrNot = 'NOT';
                break;
            default: allOrNot = "";
        }
    }
}

function getWhereBodyObjects(formToBuild, IsLtGtEQ, mOrSKey, idString) {
    const operatorsWhere = formToBuild.querySelectorAll("div[class = 'control-group condition'] option[selected]"); // this shows IS and dept
    const keysForWhere = formToBuild.querySelectorAll("div[class = 'control-group condition'] div[class = 'control term']");
    let arrayToAddtoWhere = [];
    for (let i = 0; i < keysForWhere.length; i++) {
        let selectedWhereKeys = {};
        let innerCompareBracket = {};
        let toConverttoNum = false;
        //keysForWhere should be the same
        IsLtGtEQ = operatorsWhere[i * 2 + 1].value;
        mOrSKey = operatorsWhere[i * 2].value;
        if (mOrSKey == 'avg' || mOrSKey == 'pass' || mOrSKey == 'fail' || mOrSKey == 'audit' || mOrSKey == 'year') {
            toConverttoNum = true;
        }
        fullmOrSKey = idString + '_' + mOrSKey;
        let innerCompare = keysForWhere[i].querySelectorAll('input')[0].value;
        if (toConverttoNum) {
            innerCompare = Number(innerCompare);
        }
        innerCompareBracket[fullmOrSKey] = innerCompare;
        selectedWhereKeys[IsLtGtEQ] = innerCompareBracket;
        arrayToAddtoWhere.push(selectedWhereKeys);
        // console.log(JSON.stringify(arrayToAddtoWhere));
    }
    return { keysForWhere, arrayToAddtoWhere, IsLtGtEQ, mOrSKey };
}

function idStringCoursesOrRooms(idString, COURSES, formToBuild, ROOMS) {
    const coursesDataset = document.querySelectorAll("form[data-type= 'courses'] option[selected]");
    if (coursesDataset.length > 0) {
        idString = COURSES;
        formToBuild = document.querySelectorAll("form[data-type= 'courses']")[0];
    }
    else {
        const roomsDataset = document.querySelectorAll("form[data-type= 'rooms'] option[selected]");
        if (roomsDataset.length > 0) {
            idString = ROOMS;
            formToBuild = document.querySelectorAll("form[data-type= 'rooms']")[0];
        }
    }
    return { idString, formToBuild };
}
