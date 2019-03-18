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

    query = queryWHERE(IsLtGtEQ, mOrSKey, formToBuild, idString, query);
    query = queryOPTIONS(formToBuild, idString, query);
    // console.log(query);
    // TO CONTINUE... TRANSFROM AND APPLY.

    let arrayForGroup = [];
    const fieldsForGroup = formToBuild.querySelectorAll("div[class = 'form-group groups'] input[checked= 'checked']");
    // console.log(fieldsForGroup);
    if (fieldsForGroup.length > 0) {
        for (let i = 0; i < fieldsForGroup.length; i++) {
            const keyForGroup = idString + '_' + fieldsForGroup[i].value;
            arrayForGroup.push(keyForGroup);
        }
        console.log("array for Group: " + arrayForGroup);
    }

    // for APPLY array
    let applyArrayToAdd = [];
    let applyInnerBracket = {};
    let applyInnerBracketwithLabel = {};
    const fieldsforApply = formToBuild.querySelectorAll("div[class = 'form-group transformations']");
    for (let i = 0; i < fieldsforApply.length; i++){
        const customisedLabel = fieldsforApply[i].querySelectorAll("input[type='text']")
        const keyAndFieldtoApply = fieldsforApply[i].querySelectorAll("option[selected='selected']");
        if (customisedLabel.length > 0 && keyAndFieldtoApply.length >0 ){
            const Label = customisedLabel[0].value;
            // console.log(Label);
            const applyKey = keyAndFieldtoApply[0].value;
            const applyField = keyAndFieldtoApply[1].value;
            applyInnerBracket[applyKey] = idString + '_' + applyField;
            applyInnerBracketwithLabel[Label] = applyInnerBracket;
            applyArrayToAdd.push(applyInnerBracketwithLabel);
            // console.log(JSON.stringify(applyArrayToAdd));
        }
    }

    if (applyArrayToAdd.length > 0 ){
        let tranObject = {};
        tranObject.GROUP = arrayForGroup;
        tranObject.APPLY = applyArrayToAdd;
        console.log(JSON.stringify(tranObject));
        query["TRANSFORMATIONS"] = tranObject;
    }

    // // TODO: implement
    // console.log("CampusExplorer.buildQuery not implemented yet.");
    return query;

}


function queryOPTIONS(formToBuild, idString, query) {
    let OptionsObject = getColumnANDOrderInOptions(formToBuild, idString);
    query["OPTIONS"] = OptionsObject;
    return query;
}

function queryWHERE(IsLtGtEQ, mOrSKey, formToBuild, idString, query) {
    let keysForWhere;
    let arrayToAddtoWhere;
    ({ keysForWhere, arrayToAddtoWhere, IsLtGtEQ, mOrSKey } = getKeysForWhereFunction(formToBuild, IsLtGtEQ, mOrSKey, idString));
    let allOrNot = getAllOrNotFirstCondition(formToBuild, keysForWhere);
    let objectToAddtoWhere = getWhereObjectContent(allOrNot, arrayToAddtoWhere);
    query["WHERE"] = objectToAddtoWhere;
    return query;
}

function getWhereObjectContent(allOrNot, arrayToAddtoWhere) {
    let objectToAddtoWhere = {};
    if (allOrNot.length > 0) {
        objectToAddtoWhere[allOrNot] = arrayToAddtoWhere;
    }
    else {
        objectToAddtoWhere = convertArrayToObject(arrayToAddtoWhere);
    }
    return objectToAddtoWhere;
}

function getColumnANDOrderInOptions(formToBuild, idString) {
    let arraytoAddtoColumns = [];
    const fieldsForCOLUMNS = formToBuild.querySelectorAll("div[class = 'form-group columns'] input[checked= 'checked']");
    for (let i = 0; i < fieldsForCOLUMNS.length; i++) {
        let keyForColumn = "";
        if (fieldsForCOLUMNS[i].id){
            keyForColumn = idString + '_' + fieldsForCOLUMNS[i].value;
        } else {
            keyForColumn = fieldsForCOLUMNS[i].value;
        }
        arraytoAddtoColumns.push(keyForColumn);
    }
    let ORDER = [];
    const fieldsForOrder = formToBuild.querySelectorAll("div[class = 'form-group order'] option[selected= 'selected']");
    for (let i = 0; i < fieldsForOrder.length; i++) {
        let keyForOrder = "";

        //addIdStringtoFields
        if (fieldsForOrder[i].class){
            keyForOrder = fieldsForOrder[i].value;
        } else {
            keyForOrder = idString + '_' + fieldsForOrder[i].value;
        }

        ORDER.push(keyForOrder);
    }
    let OptionsObject = {};
    OptionsObject["COLUMNS"] = arraytoAddtoColumns;
    // console.log("order order: " + ORDER);
    if (ORDER.length == 1) {
        OptionsObject["ORDER"] = ORDER[0];
    }
    else if (ORDER.length > 1) {
        OptionsObject["ORDER"] = ORDER;
    }
    return OptionsObject;
}

function convertArrayToObject(arrayconvert) {
    return arrayconvert.reduce((a, b) => Object.assign(a, b), {});
}

function getAllOrNotFirstCondition(formToBuild, keysForWhere) {
    const conditionsChecked = formToBuild.querySelectorAll('input[name= "conditionType"]');
    // console.log("key length: " + keysForWhere.length);
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
    return allOrNot;
}

function getKeysForWhereFunction(formToBuild, IsLtGtEQ, mOrSKey, idString) {
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
        // console.log("inner: " + JSON.stringify(innerCompareBracket));
        selectedWhereKeys[IsLtGtEQ] = innerCompareBracket;
        // console.log("selectedWhere: " + JSON.stringify(selectedWhereKeys));
        arrayToAddtoWhere.push(selectedWhereKeys);
        // console.log("array for Where" + JSON.stringify(arrayToAddtoWhere));
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
