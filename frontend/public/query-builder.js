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
    // let formToBuild = document.forms;
    let formToBuild = document;
    let idString = "";
    const COURSES = "courses";
    const ROOMS = "rooms";
    let IsLtGtEQ = "";
    let mOrSKey = "";


    ({ idString, formToBuild } = idStringCoursesOrRooms(idString, COURSES, formToBuild, ROOMS));

    query = buildQueryWHERE(IsLtGtEQ, mOrSKey, formToBuild, idString, query);
    query = buildQueryOPTIONS(formToBuild, idString, query);
    let arrayForGroup = buildGroupArray(formToBuild, idString);
    let applyArrayToAdd = buildAPPLYarray(formToBuild, idString);
    query = buildQueryTRANSFORM(applyArrayToAdd, arrayForGroup, query);
    return query;
};

function buildQueryTRANSFORM(applyArrayToAdd, arrayForGroup, query) {
    if (arrayForGroup.length > 0 || applyArrayToAdd.length > 0) {
        let tranObject = {};
        tranObject.GROUP = arrayForGroup;
        tranObject.APPLY = applyArrayToAdd;
        query.TRANSFORMATIONS = tranObject;
        // query["APPLY"] = applyArrayToAdd;
    }
    return query;
}

function buildAPPLYarray(formToBuild, idString) {
    let applyArrayToAdd = [];
    const fieldsforApply = formToBuild.querySelectorAll("div[class = 'control-group transformation']");
    for (let i = 0; i < fieldsforApply.length; i++) {
        const customisedLabel = fieldsforApply[i].querySelectorAll("input[type='text']");
        const keyAndFieldtoApply = fieldsforApply[i].querySelectorAll("option[selected='selected']");
        const Label = customisedLabel[0].value;
        const applyKey = keyAndFieldtoApply[0].value;
        const applyField = keyAndFieldtoApply[1].value;
        let applyInnerBracket = {};
        let applyInnerBracketwithLabel = {};
        applyInnerBracket[applyKey] = idString + '_' + applyField;
        applyInnerBracketwithLabel[Label] = applyInnerBracket;
        applyArrayToAdd.push(applyInnerBracketwithLabel);
    }
    return applyArrayToAdd;
}

function buildGroupArray(formToBuild, idString) {
    let arrayForGroup = [];
    const fieldsForGroup = formToBuild.querySelectorAll("div[class = 'form-group groups'] input[checked= 'checked']");
    if (fieldsForGroup.length > 0) {
        for (let i = 0; i < fieldsForGroup.length; i++) {
            const keyForGroup = idString + '_' + fieldsForGroup[i].value;
            arrayForGroup.push(keyForGroup);
        }
    }
    return arrayForGroup;
}

function buildQueryOPTIONS(formToBuild, idString, query) {
    query["OPTIONS"] = getColumnANDOrderInOptions(formToBuild, idString);
    return query;
}

function buildQueryWHERE(IsLtGtEQ, mOrSKey, formToBuild, idString, query) {
    let keysForWhere;
    let arrayToAddtoWhere;
    ({ keysForWhere, arrayToAddtoWhere, IsLtGtEQ, mOrSKey } = getKeysForWhereFunction(formToBuild, IsLtGtEQ, mOrSKey, idString));
    let allOrNot = getAllOrNotFirstCondition(formToBuild, keysForWhere);
    query["WHERE"] = getWhereObjectContent(allOrNot, arrayToAddtoWhere);
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
    // const coursesKeys = ['dept', 'id', 'avg', 'instructor', 'title', 'pass', 'fail','audit','uuid','year'];
    // const roomsKeys = ['fullname', 'furniture', 'href', 'lat', 'lon', 'name', 'number', 'seats', 'shortname', 'type'];
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

        keyForOrder = fieldsForOrder[i].value;
        if(!fieldsForOrder[i].className){
            keyForOrder = idString + '_' + fieldsForOrder[i].value;
        }
        else if(fieldsForOrder[i].className === "transformation"){
            keyForOrder = fieldsForOrder[i].value;
        }
        ORDER.push(keyForOrder);
    }
    let OptionsObject = {};
    OptionsObject["COLUMNS"] = arraytoAddtoColumns;
    if (ORDER.length === 0){
        return OptionsObject;
    }
    let OrderKeysObject = {};
    const dirChecked = formToBuild.querySelectorAll("div[class = 'control descending'] input[checked= 'checked']");
    if (dirChecked.length > 0){
        OrderKeysObject.dir = "DOWN";
        OrderKeysObject.keys = ORDER;
        OptionsObject["ORDER"] = OrderKeysObject;
        return OptionsObject;
    } else {
        if(ORDER.length > 1){
            OrderKeysObject.dir = "UP";
            OrderKeysObject.keys = ORDER;
            OptionsObject["ORDER"] = OrderKeysObject;
            return OptionsObject;
        }
        else{
            OptionsObject["ORDER"] = ORDER[0];
            return OptionsObject;
        }
    }
}

function convertArrayToObject(arrayconvert) {
    return arrayconvert.reduce((a, b) => Object.assign(a, b), {});
}

function getAllOrNotFirstCondition(formToBuild, keysForWhere) {
    const conditionsChecked = formToBuild.querySelectorAll("input[name= 'conditionType']");
    let allOrNot = "";
    const ALL = 'all';
    const OR = 'any';
    const NOT = 'none';
    for (let i = 0; i < conditionsChecked.length; i++){
        if (conditionsChecked[i].checked) {
            const allOrNotValue = conditionsChecked[i].value;
            if (keysForWhere.length <= 1) {
                allOrNot = "";
            }
            else {
                switch (allOrNotValue) {
                    case ALL:
                        allOrNot = 'AND';
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
    }
    return "";
}


function getKeysForWhereFunction(formToBuild, IsLtGtEQ, mOrSKey, idString) {
    const operatorsWhere = formToBuild.querySelectorAll("div[class = 'control-group condition'] option[selected]"); // this shows IS and dept
    const keysForWhere = formToBuild.querySelectorAll("div[class = 'control-group condition'] div[class = 'control term']");
    const keyNotpresent = formToBuild.querySelectorAll("div[class = 'control-group condition'] div[class = 'control not']");
    let arrayToAddtoWhere = [];
    const mfields = ['avg','pass','fail','audit', 'year', 'lat', 'lon','seats'];
    for (let i = 0; i < keysForWhere.length; i++) {
        let selectedWhereKeys = {};
        let selectedWhereKeysAfterNot = {};
        let innerCompareBracket = {};
        let toConverttoNum = false;
        IsLtGtEQ = operatorsWhere[i * 2 + 1].value;
        mOrSKey = operatorsWhere[i * 2].value;
        if (mfields.includes(mOrSKey)) {
            toConverttoNum = true;
        }
        let fullmOrSKey = idString + '_' + mOrSKey;
        let innerCompare = keysForWhere[i].querySelectorAll('input')[0].value;
        if (toConverttoNum) {
            if(!isNaN(parseFloat(innerCompare))) {
                innerCompare = parseFloat(innerCompare);
            }
        }

        innerCompareBracket[fullmOrSKey] = innerCompare;
        selectedWhereKeys[IsLtGtEQ] = innerCompareBracket;
        if (keyNotpresent[i].querySelectorAll("input[checked='checked']").length > 0){
            const NOT = "NOT";
            selectedWhereKeysAfterNot[NOT] = selectedWhereKeys;
        } else {
            selectedWhereKeysAfterNot = selectedWhereKeys;
        }
        arrayToAddtoWhere.push(selectedWhereKeysAfterNot);
    }
    return { keysForWhere, arrayToAddtoWhere, IsLtGtEQ, mOrSKey };
}

function idStringCoursesOrRooms(idString, COURSES, formToBuild, ROOMS) {
    debugger;
    const active = document.querySelectorAll("div[class = 'tab-panel active']");
    if(active[0].id === "tab-courses"){
        idString = COURSES;
        formToBuild = document.querySelectorAll("form[data-type= 'courses']")[0];
    }else if(active[0].id === "tab-rooms"){
        idString = ROOMS;
        formToBuild = document.querySelectorAll("form[data-type= 'rooms']")[0];
    }
    return { idString, formToBuild };
}
