"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFilesToUpload = void 0;
var glob = require("@actions/glob");
var path = require("path");
var core_1 = require("@actions/core");
var fs_1 = require("fs");
var path_1 = require("path");
var util_1 = require("util");
var stats = util_1.promisify(fs_1.stat);
function getDefaultGlobOptions() {
    return {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    };
}
/**
 * If multiple paths are specific, the least common ancestor (LCA) of the search paths is used as
 * the delimiter to control the directory structure for the artifact. This function returns the LCA
 * when given an array of search paths
 *
 * Example 1: The patterns `/foo/` and `/bar/` returns `/`
 *
 * Example 2: The patterns `~/foo/bar/*` and `~/foo/voo/two/*` and `~/foo/mo/` returns `~/foo`
 */
function getMultiPathLCA(searchPaths) {
    if (searchPaths.length < 2) {
        throw new Error('At least two search paths must be provided');
    }
    var commonPaths = new Array();
    var splitPaths = new Array();
    var smallestPathLength = Number.MAX_SAFE_INTEGER;
    // split each of the search paths using the platform specific separator
    for (var _i = 0, searchPaths_1 = searchPaths; _i < searchPaths_1.length; _i++) {
        var searchPath = searchPaths_1[_i];
        core_1.debug("Using search path " + searchPath);
        var splitSearchPath = path.normalize(searchPath).split(path.sep);
        // keep track of the smallest path length so that we don't accidentally later go out of bounds
        smallestPathLength = Math.min(smallestPathLength, splitSearchPath.length);
        splitPaths.push(splitSearchPath);
    }
    // on Unix-like file systems, the file separator exists at the beginning of the file path, make sure to preserve it
    if (searchPaths[0].startsWith(path.sep)) {
        commonPaths.push(path.sep);
    }
    var splitIndex = 0;
    // function to check if the paths are the same at a specific index
    function isPathTheSame() {
        var compare = splitPaths[0][splitIndex];
        for (var i = 1; i < splitPaths.length; i++) {
            if (compare !== splitPaths[i][splitIndex]) {
                // a non-common index has been reached
                return false;
            }
        }
        return true;
    }
    // loop over all the search paths until there is a non-common ancestor or we go out of bounds
    while (splitIndex < smallestPathLength) {
        if (!isPathTheSame()) {
            break;
        }
        // if all are the same, add to the end result & increment the index
        commonPaths.push(splitPaths[0][splitIndex]);
        splitIndex++;
    }
    return path.join.apply(path, commonPaths);
}
function findFilesToUpload(searchPath, globOptions) {
    return __awaiter(this, void 0, Promise, function () {
        var searchResults, globber, rawSearchResults, set, _i, rawSearchResults_1, searchResult, fileStats, searchPaths, lcaSearchPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    searchResults = [];
                    return [4 /*yield*/, glob.create(searchPath, globOptions || getDefaultGlobOptions())];
                case 1:
                    globber = _a.sent();
                    return [4 /*yield*/, globber.glob()
                        /*
                          Files are saved with case insensitivity. Uploading both a.txt and A.txt will files to be overwritten
                          Detect any files that could be overwritten for user awareness
                        */
                    ];
                case 2:
                    rawSearchResults = _a.sent();
                    set = new Set();
                    _i = 0, rawSearchResults_1 = rawSearchResults;
                    _a.label = 3;
                case 3:
                    if (!(_i < rawSearchResults_1.length)) return [3 /*break*/, 6];
                    searchResult = rawSearchResults_1[_i];
                    return [4 /*yield*/, stats(searchResult)
                        // isDirectory() returns false for symlinks if using fs.lstat(), make sure to use fs.stat() instead
                    ];
                case 4:
                    fileStats = _a.sent();
                    // isDirectory() returns false for symlinks if using fs.lstat(), make sure to use fs.stat() instead
                    if (!fileStats.isDirectory()) {
                        core_1.debug("File:" + searchResult + " was found using the provided searchPath");
                        searchResults.push(searchResult);
                        // detect any files that would be overwritten because of case insensitivity
                        if (set.has(searchResult.toLowerCase())) {
                            core_1.info("Uploads are case insensitive: " + searchResult + " was detected that it will be overwritten by another file with the same path");
                        }
                        else {
                            set.add(searchResult.toLowerCase());
                        }
                    }
                    else {
                        core_1.debug("Removing " + searchResult + " from rawSearchResults because it is a directory");
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    searchPaths = globber.getSearchPaths();
                    if (searchPaths.length > 1) {
                        core_1.info("Multiple search paths detected. Calculating the least common ancestor of all paths");
                        lcaSearchPath = getMultiPathLCA(searchPaths);
                        core_1.info("The least common ancestor is " + lcaSearchPath + ". This will be the root directory of the artifact");
                        return [2 /*return*/, {
                                filesToUpload: searchResults,
                                rootDirectory: lcaSearchPath
                            }];
                    }
                    /*
                      Special case for a single file artifact that is uploaded without a directory or wildcard pattern. The directory structure is
                      not preserved and the root directory will be the single files parent directory
                    */
                    if (searchResults.length === 1 && searchPaths[0] === searchResults[0]) {
                        return [2 /*return*/, {
                                filesToUpload: searchResults,
                                rootDirectory: path_1.dirname(searchResults[0])
                            }];
                    }
                    return [2 /*return*/, {
                            filesToUpload: searchResults,
                            rootDirectory: searchPaths[0]
                        }];
            }
        });
    });
}
exports.findFilesToUpload = findFilesToUpload;
