"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fspath = require("path");
const recursive = require("recursive-readdir");
const Util_1 = require("../src/Util");
class TestUtil {
    static readFileAsync(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    static readTestQueries(path = "test/queries") {
        return __awaiter(this, void 0, void 0, function* () {
            const methodName = "TestUtil::readTestQueries --";
            const extName = ".json";
            const testQueries = [];
            let files;
            try {
                const allFiles = yield recursive(path);
                files = allFiles.filter((p) => fspath.extname(p) === extName);
                if (files.length === 0) {
                    Util_1.default.warn(`${methodName} No query files found in ${path}.`);
                }
            }
            catch (err) {
                Util_1.default.error(`${methodName} Exception reading files in ${path}.`);
                throw err;
            }
            for (const file of files) {
                const skipFile = file.replace(__dirname, "test");
                let content;
                try {
                    content = yield TestUtil.readFileAsync(file);
                }
                catch (err) {
                    Util_1.default.error(`${methodName} Could not read ${skipFile}.`);
                    throw err;
                }
                try {
                    const query = JSON.parse(content.toString());
                    TestUtil.validate(query, { title: "string", query: null, isQueryValid: "boolean", result: null });
                    query["filename"] = file;
                    testQueries.push(query);
                }
                catch (err) {
                    Util_1.default.error(`${methodName} ${skipFile} does not conform to the query schema.`);
                    throw new Error(`In ${file} ${err.message}`);
                }
            }
            return testQueries;
        });
    }
    static validate(content, schema) {
        for (const [property, type] of Object.entries(schema)) {
            if (!content.hasOwnProperty(property)) {
                throw new Error(`required property ${property} is missing.`);
            }
            else if (type !== null && typeof content[property] !== type) {
                throw new Error(`the value of ${property} is not ${type === "object" ? "an" : "a"} ${type}.`);
            }
        }
    }
}
exports.default = TestUtil;
//# sourceMappingURL=TestUtil.js.map