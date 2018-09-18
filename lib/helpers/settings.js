'use babel';

export const OPTIONAL_SCHEMA = ['matchNumber'];
export const CONFIG_SCHEMA = ['search', 'test', 'searchDir'];
export const REGEX_SCHEMA = ['test']; // properise which need to be regex
// 'search' - is changed to regex after swappings data fropm test e.g. test/(1)/*.js

export const ERRORS = {
  missingConfig: 0,
  configParseError: 1,
}
