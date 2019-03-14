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
    const formToBuild = document.forms.item(1);
    // console.log(document.forms);
    // console.log(formToBuild.attributes[0].value);
    if (formToBuild.attributes[0].value == 'courses'){
        for (const formChildNode of formToBuild.childNodes){
            // console.log(formChildNode);
            console.log("next");
            if (formChildNode.attributes && formChildNode.attributes[0].value == "form-group conditions"){
                console.log(formChildNode.attributes[0].value);
                console.log("done");
                // findGroupConditions
                for (const conditionnode of formChildNode.childNodes){
                    console.log(conditionnode);
                    console.log("omg");
                }
            }
        }
    }

    // TODO: implement
    console.log("CampusExplorer.buildQuery not implemented yet.");
    return query;
};
