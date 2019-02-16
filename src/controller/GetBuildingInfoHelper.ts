import { latAndLon } from "./GetLatandLon";
import { InsightError } from "./IInsightFacade";
import Log from "../Util";
import { debug } from "util";

// tslint:disable

const removeBackLash = 3;

export const findBuildingNameFromFile = (nodes: any, fullname: any): any => {
    if (nodes.parentNode != null && nodes.parentNode.attrs && nodes.parentNode.attrs.length > 0 && nodes.value != null
        && nodes.nodeName === "#text" && nodes.parentNode.nodeName === "span" &&
        nodes.parentNode.attrs[0].value === "field-content" && nodes.parentNode.parentNode.nodeName === "h2") {
        fullname = nodes.value;
        return fullname;
    } else if (nodes.childNodes) {
        for (let i = 0; i < nodes.childNodes.length; i ++){
            const rtValue = this.findBuildingNameFromFile(nodes.childNodes[i], fullname);
            if (rtValue) {
                return rtValue;
            }
        }
    }
}

export const getBuildingInfo = (trChildNodes: any, building: any): Promise<any> => { // childNodes of trNode
    for (const onlyWantTD of trChildNodes) {
        if (onlyWantTD.nodeName == "td" && onlyWantTD.attrs && onlyWantTD.childNodes){
            for (const tdAttr of onlyWantTD.attrs) {
                if (tdAttr.name === "class") {
                    if ( tdAttr.value === "views-field views-field-field-building-code"){
                        for (let i = 0; i < onlyWantTD.childNodes.length; i++) {
                            if (onlyWantTD.childNodes[i].nodeName === "#text") {
                                const shortname = onlyWantTD.childNodes[i].value.substring(2).trim();
                                building["shortname"] = shortname;
                            }
                        }
                    } if (tdAttr.value === "views-field views-field-title") {
                        this.getBuildingInfo(onlyWantTD.childNodes, building);
                    }
                    if (tdAttr.value === "views-field views-field-field-building-image") {
                        this.getBuildingInfo(onlyWantTD.childNodes, building);
                    }
                    if (tdAttr.value ==="views-field views-field-field-building-address"){
                        for (let i = 0; i < onlyWantTD.childNodes.length; i++) {
                            const addRaw = onlyWantTD.childNodes[i];
                            if (addRaw.nodeName === "#text" && addRaw.value.length >= 3) {
                                const address = addRaw.value.substring(removeBackLash).trim();
                                building["address"] = address;
                            }
                        }
                    }
                }
            }
        }
        else if (onlyWantTD.nodeName === 'a' && onlyWantTD.attrs.length >= 1){
            if (onlyWantTD.attrs.length > 1) {
            this.getBuildingInfo(onlyWantTD.attrs, building);
            }
            this.getBuildingInfo(onlyWantTD.childNodes, building);
            }
        else if (onlyWantTD.name === "href") {
            const href = onlyWantTD.value.substring(2);
            building["href"] = href;
        }
        else if (onlyWantTD.nodeName === "#text" && onlyWantTD.value.substring(removeBackLash).trim().length >= 1) {
            const fullname = onlyWantTD.value.trim();
            building["fullname"] = fullname;
        }
    }
    return building;
}

export const getLanandLon = async (building: any) => {
    try {
        building["lat"] = 0;
        building[ "lon"] = 0;
        const promiselat = await latAndLon(building["address"]);
        building["lat"] = promiselat["lat"];
        building["lon"] = promiselat["lon"];
        return building;
     } catch (err) {
        debugger;
        Log.error(err);
    }
}

export const addRoomsPerBuilding = (node: any, validRooms: any, validRoom: any): any => {
    // debugger;
    if (node.parentNode && node.parentNode.parentNode &&
        node.parentNode.parentNode.nodeName === "tbody"){//looking at tr childnodes
        if (node.attrs && node.childNodes){
        const checkValue = node.attrs;
        for (let i = 0; i < checkValue.length; i++) {
            if (checkValue[i].value === "views-field views-field-field-room-number") {
                // if a - find href and number
                debugger;
                node.childNodes.forEach( (ifaNode: any) => {
                    if (ifaNode.nodeName === "a") {
                        if (ifaNode.attrs && ifaNode.attrs[0].name === "href"){
                            validRoom["href"] = ifaNode.attrs[0].value;
                    }
                }
            });
            }
        }
        if (checkValue.parentNode.value === "views-field views-field-field-room-capacity") {
            // node.childNodes[0].value
        }
    }
    }
    if (node.childNodes) {
        node.childNodes.forEach( (nodetoCheck: any) => {
            addRoomsPerBuilding(nodetoCheck, validRooms, validRoom);
        });

    }
    if (validRoom["number"] && validRoom["name"]) {
        validRooms.push(validRoom);
    }
    return validRooms;
}
