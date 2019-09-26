var path = require('path');
var winston = require('winston');
var errorLog = path.join(__dirname,'../logs/error.log');
var moment = require('moment');
var config = require('./config');

var formatJson = function (json, option) {
    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '  ';
    options = options || {};
    options.newlineAfter = (option.newlineAfter === true) ? true : false;
    options.spaceAfter = (option.spaceAfter === false) ? false : true;
    if (typeof json !== 'string') {
        json = JSON.stringify(json);
    }else {
        json = JSON.parse(json);
        json = JSON.stringify(json);
    }
    reg = /([\{\}])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /([\[\]])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /(\,)/g;
    json = json.replace(reg, '$1\r\n');
    reg = /(\r\n\r\n)/g;
    json = json.replace(reg, '\r\n');
    reg = /\r\n\,/g;
    json = json.replace(reg, ',');
    if(!option.newlineAfter) {
        reg = /\:\r\n{/g;
        json = json.replace(reg, ':{}');
        reg = /\:\r\n\[/g;
        json = json.replace(reg, ':[');
    }
    if (options.spaceAfter ) {
        reg = /\:/g;
        json = json.replace(reg, ':');
    }
    (json.split('\r\n')).forEach( (node, index) => {
        var i = 0,
            indent = 0,
            padding = '';
        if (node.match(/\{$/) || node.match(/\]/)) {
            indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
            if (pad !==0) {
                pad = -1;
            }
        } else {
            indent = 0;
        }

        for(i=0;i<pad;i++) {
            padding += PADDING;
        }
        
        formatted += padding + node + '\r\n';
        pad += indent;
    });
    return formatted;
};

// 获取代码文件，函数，行号
Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_,stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return
    }
});

Object.defineProperty(global, '__line', {
    get: function () {
        return __stack[1].getLineNumber();
    }
});
Object.defineProperty(global, '__function', {
    get: function () {
        return __stack[1].getFunctionNumber();
    }
});
Object.defineProperty(global, '__file', {
    get: function () {
        return __stack[1].getFileNumber();
    }
});
/**
 * @description 错误日志  silly: 5, debug:4,verbose:3,info:2,warn:1,error:0
 */
var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.Console)({
            level: 'silly'
        }),
        new (winston.transports.File)({
            filename: errorLog,
            level: false,
            timestamp: function () {
                return moment().format('YYYY-MM-DD, HH:mm:ss');
            },
            formatter: function (options) {
                // Return string will be passed to logger.
                let message = options.message || '';
                return options.timestamp()
                + ' | ' + options.level.toUpperCase();
                + ' | [message]' + message

            }
        }),
    ]
});

var formatterLogger = function ( msg, line, func, file ) {
    var str = '';
    if(typeof (msg) != 'undefined') {
        console.log(msg);
        console.log(typeof msg);
        if (tppeof (msg) == 'object') {
            str += formatJson(msg);
        }else if (typeof (msg) == 'string') {
            str += msg;
        } else {
            str += formatJson(msg);
        }
        if (typeof (line) !== 'undefined') {
            str += ' | [line] ' + line;
            if (typeof (func) != 'undefined') {
                str += ' | [line] ' + func;
                if(typeof (file) != 'undefined') {
                    str += ' | [line] ' + file;
                }
            }
        }
    };
    return str;
}

module.exports = {
    logger,
    formatterLogger
}

