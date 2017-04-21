/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const jsonViewer = __webpack_require__(1);

	function errorHandle(e, errMsg){

	}

	function diff(){
	  let leftElem = document.querySelector('#left');

	  let rightElem = document.querySelector('#right');

	  let left, right;

	  try{
	    left = JSON.parse(leftElem.value.trim());
	  }catch(e){
	    errorHandle(e, 'left json invalid');
	  }

	  try{
	    right = JSON.parse(rightElem.value.trim());
	  }catch(e){
	    errorHandle(e, 'right json invalid');
	  }

	  console.log('....', left, right);
	  let res = jsonViewer({
	      left: left,
	      right: right
	  });

	  let content = document.querySelector('#content');
	  content.innerHTML = "";
	  content.appendChild(res);
	}

	document.querySelector('.diff').addEventListener('click', diff);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const diff = __webpack_require__(3);

	const display = __webpack_require__(5);

	let appendContent = ({ left = {}, right = {} }, options) => {
	    let {merge, diffMap} = diff(left, right);
	    let content = display(merge, diffMap, options).join('');
	    let body = document.body;
	    let container = document.createElement('div');
	    container.className = 'jDiff-container';
	    container.innerHTML = content;
	    return container;
	};

	module.exports = appendContent;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	/**
	 * {
	 *   path: {
	 *     type: add/delete/edit,
	 *     modify: right value
	 *   }
	 * }
	 * @type {Object}
	 */
	const _ = __webpack_require__(4);

	let deepEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

	let isExist = item => item !== undefined;

	let mergeJson = (left, right, root = null, diffMap = {}) => {
	    let merge = {};
	    if (deepEqual(left, right)) {
	        return left;
	    }
	    let lKeys = Object.keys(left);
	    let rKeys = Object.keys(right);
	    lKeys.forEach(k => {
	        let rItem = right[k];
	        let lItem = left[k];
	        let path = root ? `${root}.${k}` : k;
	        if (isExist(rItem)) {
	            if (_.isObjorArr(rItem) && _.isObjorArr(lItem)) {
	                left[k] = mergeJson(lItem, rItem, path, diffMap);
	            } else {
	                if(lItem !== rItem) {
	                    diffMap[path] = {
	                        type: 'edit',
	                        modify: rItem
	                    };
	                }
	            }
	        } else {
	            diffMap[path] = {
	                type: 'delete'
	            };
	        }
	    });
	    // add node
	    let remainKeys = rKeys.filter(rk => lKeys.indexOf(rk) === -1);
	    remainKeys.forEach(ak => {
	        left[ak] = right[ak];
	        let path = root ? `${root}.${ak}` : ak;
	        diffMap[path] = {
	            type: 'add'
	        };
	    });
	    return left;
	};

	let run = (left = {}, right = {}) => {
	    let merge;
	    let diffMap = {};
	    if (_.isObjorArr(left) && _.isObjorArr(right)) {
	        merge = mergeJson(left, right, null, diffMap);
	    } else {
	        merge = left;
	        diffMap = {
	            type: 'edit',
	            modify: right
	        };
	    }
	    return {
	        merge,
	        diffMap
	    };
	};

	module.exports = run;


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	const _ = {};

	_.isArray = arr => Array.isArray(arr);

	_.isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

	_.isObjorArr = val => _.isArray(val) || _.isObject(val);

	_.isNumber = num => typeof num === 'number';

	module.exports = _;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const _ = __webpack_require__(4);
	let SPACE = 10;
	let INDENT = 2;

	let getIndentStyle = space => `margin-left: ${space}px`;

	let getColorStyle = color => {
	    if(color === 'delete'){
	        return 'color: red';
	    }else if(color === 'add'){
	        return 'color: green';
	    }else{
	        return '';
	    }
	};

	let getDeepByPath = path => path.split('.').length;

	let matchPrefix = (paths, path) => {
	    let matchPath = [];
	    for (let i = 0; i < paths.length; i++) {
	        let p = paths[i];
	        let regpath = path.replace('.', '\.');
	        let reg = new RegExp(`^${regpath}`);
	        if (reg.test(p)) {
	            return true;
	        }
	    }
	    return false;
	};

	let getStringifyIndent = str => {
	    let match = str.match(/^(\s*)\S*/);
	    if (match) {
	        return match[1].length;
	    }
	    return 0;
	};

	let replaceIndent = str => {
	    return str.replace(/^(\s*)/, '');
	};

	let htmlLine = (line, deep, color) => {
	    let curSpace = deep * INDENT * SPACE + getStringifyIndent(line) * SPACE;
	    let indentStyle = getIndentStyle(curSpace);
	    let style = indentStyle;
	    let colorStyle = '';
	    if(color){
	        colorStyle = `style = "${getColorStyle(color)}"`;
	    }
	    line = replaceIndent(line);
	    let label = '&nbsp;&nbsp';
	    if (color === 'add') {
	        label = '+';
	    } else if (color === 'delete') {
	        label = '-';
	    }
	    return `<div ${colorStyle}><span>${label}</span><span style="${style}">${line}</span></div>`;
	};

	let formatObj = (k = null, obj, path, isLast = false, color = null) => {
	    let deep = getDeepByPath(path);
	    let stJson = JSON.stringify(obj, null, INDENT).split('\n');
	    if (k) {
	        let label = stJson[0];
	        stJson[0] = `"${k}" : ${label}`;
	    }
	    if (!isLast) {
	        let endLine = stJson.length - 1;
	        stJson[endLine] = stJson[endLine] + ',';
	    }
	    return stJson.map(item => htmlLine(item, deep, color));
	};

	let formatStr = (k, val, path, isLast = false, color = null) => {
	    let deep = getDeepByPath(path);
	    let v = _.isNumber(val) ? val : `\"${val}\"`;
	    if (!isLast) {
	        v = v + ',';
	    }
	    let seq = k ? `"${k}": ${v}` : `${v}`;
	    return htmlLine(seq, deep, color);
	};

	let format = (k, val, path, isLast, color = null) => {
	    // avoid array key
	    if (!isNaN(k)) {
	        k = null;
	    }
	    if (_.isObjorArr(val)) {
	        return formatObj(k, val, path, isLast, color);
	    } else {
	        return [formatStr(k, val, path, isLast, color)];
	    }
	};

	let formatDiff = (diffItem, k, val, path, isLast) => {
	    let type = diffItem.type;
	    if (type === 'add') {
	        return format(k, val, path, isLast, 'add');
	    } else if (type === 'delete') {
	        return format(k, val, path, isLast, 'delete');
	    } else if (type === 'edit') {
	        let modify = diffItem.modify;
	        return format(k, val, path, isLast, 'delete').concat(format(k, modify, path, isLast, 'add'));
	    }
	};

	let findDiff = (diff, k, val, path, isLast) => {
	    if (diff[path]) {
	        return formatDiff(diff[path], k, val, path, isLast);
	    }else{
	        let deep = getDeepByPath(path);
	        let style = getIndentStyle(deep * INDENT * SPACE);
	        let tokens = display(val, diff, path);
	        if (!isNaN(k)) {
	            k = null;
	        }
	        wrapJson(val, tokens, style, k, isLast);
	        return tokens;
	    }
	};

	let display = (json, diff, root = null) => {
	    let tokens = [];
	    let keys = Object.keys(json);
	    let paths = Object.keys(diff);
	    keys.forEach((k, idx) => {
	        let val = json[k];
	        let path = root ? `${root}.${k}` : k;
	        let isLast = idx === keys.length - 1;
	        let token;
	        if (matchPrefix(paths, path)) {
	            token = findDiff(diff, k, val, path, isLast);
	        } else {
	            token = format(k, val, path, isLast);
	        }
	        [].push.apply(tokens, token);
	    });
	    return tokens;
	};

	let wrapJson = (json, token, style = '', k = null, isLast = true) => {
	    let key = k ? `"${k}": ` : '';
	    let comma = isLast ? '' : ',';
	    if (_.isArray(json)) {
	        token.push(`<div><span>&nbsp;&nbsp;</span><span style="${style}">]${comma}</span></div>`);
	        token.unshift(`<div><span>&nbsp;&nbsp;</span><span style="${style}">${key}[</span></div>`);
	    } else if (_.isObject(json)) {
	        token.push(`<div><span>&nbsp;&nbsp;</span><span style="${style}">}${comma}</span></div>`);
	        token.unshift(`<div><span>&nbsp;&nbsp;</span><span style="${style}">${key}{</span></div>`);
	    }
	};

	let run = (json, diff, options = {}) => {
	    if(options.space){
	        SPACE = options.space;
	    }
	    if(options.indent){
	        INDENT = options.indent;
	    }
	    let tokens = display(json, diff);
	    wrapJson(json, tokens);
	    return tokens;
	};

	module.exports = run;


/***/ }
/******/ ]);