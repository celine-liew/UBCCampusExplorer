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

export const addRoomsPerBuilding = (node: any, buildingValidRooms: any, validRoomTemplate: any): any => {
    if (node.childNodes && node.nodeName === "tbody") {
        node.childNodes.forEach( (trNodetoCheck: any) => {
            if (trNodetoCheck.nodeName === "tr") {
                let validRoom: any = {};
                validRoom["shortname"] = validRoomTemplate["shortname"];
                buildingValidRooms = processTRRow(trNodetoCheck, buildingValidRooms, validRoom, validRoomTemplate);
            }
        });
        return buildingValidRooms;
    } else if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++){
                addRoomsPerBuilding(node.childNodes[i], buildingValidRooms, validRoomTemplate);
        }
    }
    return buildingValidRooms;
}

export const processTRRow = (node: any, buildingValidRooms:any, validRoom: any, validRoomTemplate: any ):any => {
            validRoom = findValidRoom(node, validRoom);
            if (validRoom["number"] && validRoom["name"] && validRoom["seats"]) {
                Object.keys(validRoomTemplate).forEach(function(key) {
                    validRoom[key] = validRoomTemplate[key];
                  });
                buildingValidRooms.push(validRoom);
            }
            return buildingValidRooms;

    }

export const findValidRoom = (node: any, validRoom: any): any => {
    if (node.parentNode && node.parentNode.parentNode &&
        node.parentNode.parentNode.nodeName === "tbody"){//looking at tr childnodes
        if (node.attrs && node.childNodes){
        const checkValue = node.attrs;
            for (let i = 0; i < checkValue.length; i++) {
                // findHrefNumberAndName
                if (checkValue[i].value === "views-field views-field-field-room-number") {
                    node.childNodes.forEach( (ifaNode: any) => {
                        if (ifaNode.nodeName === "a" && ifaNode.attrs) {
                            for (let i = 0; i < ifaNode.attrs.length; i++ ){
                                if (ifaNode.attrs[i].name === "href"){
                                    validRoom["href"] = ifaNode.attrs[i].value;
                                }
                                if (ifaNode.attrs[i].value === "Room Details"){
                                    validRoom["number"] = ifaNode.childNodes[0].value;
                                    validRoom["name"] = validRoom["shortname"] + "_" + validRoom["number"];
                                }
                            }

                    }
                });
                }

                //findSeats
                if (checkValue[i].value === "views-field views-field-field-room-capacity"){
                    node.childNodes.forEach( (roomCapChildNode: any) => {
                        if (roomCapChildNode.nodeName = "#text" && roomCapChildNode.value.substring(removeBackLash).trim().length >= 0) {
                            validRoom["seats"] = parseInt(roomCapChildNode.value.trim());
                        }
                    });
                }

                //findFurniture
                if (checkValue[i].value === "views-field views-field-field-room-furniture"){
                    node.childNodes.forEach( (roomFurChildNode: any) => {
                        if (roomFurChildNode.nodeName = "#text" && roomFurChildNode.value.substring(removeBackLash).trim().length >= 0) {
                            validRoom["furniture"] = roomFurChildNode.value.trim();
                        }
                    });
                }

                //findRoomType
                if (checkValue[i].value === "views-field views-field-field-room-type"){
                    node.childNodes.forEach( (roomTypeChildNode: any) => {
                        if (roomTypeChildNode.nodeName = "#text" && roomTypeChildNode.value.substring(removeBackLash).trim().length >= 0) {
                            validRoom["type"] = roomTypeChildNode.value.trim();
                        }
                    });
                }
            }
        }
    }
    if (node.childNodes) {
        node.childNodes.forEach( (nodetoCheck: any) => {
            return findValidRoom(nodetoCheck, validRoom);
        });
    }
    if (validRoom["number"] && validRoom["name"] && validRoom["seats"] &&  validRoom["type"]) {
        return validRoom;
    } else return;
}
