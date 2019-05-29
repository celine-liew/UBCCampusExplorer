import { latAndLon } from "./GetLatandLon";
import { InsightError } from "./IInsightFacade";
import Log from "../Util";
import { debug } from "util";
const parse5 = require("parse5");

// tslint:disable

const removeBackLash = 3;

export const  findTableInIndex = (files: string[], fileNames: string[]): any => {
    // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    const tableToCheck = parse5.parseFragment(tBody).childNodes[0];
    return tableToCheck;
};

export const findBuildingNameFromFile = (nodes: any, fullname: any): any => {
    // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
}

export const processIfTrNode = async(trNode: any, building: any, listofBuildings: any) => {
    if (trNode.nodeName === "tr" && trNode.attrs) {
        const buildingwithAdd = getBuildingInfo(trNode.childNodes, building);
        const buildingtoPush = await getLanandLon(buildingwithAdd);
        listofBuildings.push(buildingtoPush);
    }
}

export const getBuildingInfo = (trChildNodes: any, building: any): Promise<any> => { // childNodes of trNode
    for (const onlyWantTD of trChildNodes) {
       // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
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
  // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    return buildingValidRooms;
}

export const processTRRow = (node: any, buildingValidRooms:any, validRoom: any, validRoomTemplate: any ):any => {
            validRoom = findValidRoom(node, validRoom);
           // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
            return buildingValidRooms;

    }

export const findValidRoom = (node: any, validRoom: any): any => {
    // ** code removed to adhere to collaboration policy
    //* and to benefit future cohorts */
    if (validRoom["number"] && validRoom["name"] && validRoom["seats"] &&  validRoom["type"] === ""|| validRoom["type"] ) {
        return validRoom;
    } else {
        validRoom = {}
        return validRoom };
}
