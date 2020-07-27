'use strict';

var crossDominError = 'script error';
var reportUrl = 'http://prod.com';
var reportUrlTest = 'http://test.com';
var whiteHostList = ['a.com', 'b.com'];

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var qsStringify = function qsStringify(obj) {
    var result = '';
    (function loop(obj) {
        Object.keys(obj).forEach(function (v, i) {
            // TODO: array and obj
            if (_typeof(obj[v]) === 'object') {
                loop(obj[v]);
            } else {
                // 最后一项没有&
                if (i === Object.keys(obj).length - 1) {
                    result += v + '=' + obj[v];
                } else {
                    result += v + '=' + obj[v] + '&';
                }
            }
        });
    })(obj);
    return result;
};

function Report(options) {
    this.defaultOpt = {
        reportUrl: reportUrl,
        rate: 100,
        referer: window.location.href,
        level: 'ERROR'
    };
}

Report.prototype.init = function (options) {
    if (!options.appKey) {
        console.error('appKey不能为空');
        return;
    }
    if (options.env === 'test') {
        Object.assign(this.defaultOpt, {
            reportUrl: reportUrlTest
        });
    }

    Object.assign(this.defaultOpt, options);
};
/**
 * @description: 上报日志
 * @param {type} 
 * @return: 
 */
Report.prototype.report = function (options) {
    if (!this.defaultOpt.appKey) {
        console.error('appKey不能为空');
        return;
    }
    if (this.defaultOpt.env !== 'test' && whiteHostList.indexOf(window.location.host) === -1) {
        return;
    }
    if (window.sessionStorage) {
        var preTime = window.sessionStorage.getItem('preReportTime');
        var preReportMsg = window.sessionStorage.getItem('preReportMsg');
        if (preTime && preReportMsg) {
            // 间隔小于1s，则不上报
            if (+new Date() - +preTime <= 1000 && preReportMsg == options.message) {
                return;
            }
            window.sessionStorage.setItem('preReportTime', +new Date());
            window.sessionStorage.setItem('preReportMsg', options.message);
        } else {
            window.sessionStorage.setItem('preReportTime', +new Date());
            window.sessionStorage.setItem('preReportMsg', options.message);
        }
    }
    var reportParams = {};
    Object.assign(reportParams, this.defaultOpt, options);
    var rate = Math.random() * 100;
    if (rate < this.defaultOpt.rate) {
        this.compatibleHandle(reportParams);
    }
    // window.onload = window.onunload = function (event){
    // }.bind(this)
};
/**
 * @description: 统一兼容
 * @param {options}:  
 * @return: 
 */
Report.prototype.compatibleHandle = function (options) {
    if (navigator.sendBeacon) {
        var data = JSON.stringify(options);
        /* let blob = new Blob([data], {
            type: 'application/json; charset=UTF-8'
        }) */
        navigator.sendBeacon(options.reportUrl + '/report', data);
    } else {
        var image = new Image();
        image.src = options.reportUrl + '/report.gif?' + qsStringify(options);
    }
};
window.MiniMonitor = new Report();

var TryCatch = function TryCatch() {
    ['EventTarget', 'Window', 'Node', 'ApplicationCache', 'AudioTrackList', 'ChannelMergerNode', 'CryptoOperation', 'EventSource', 'FileReader', 'HTMLUnknownElement', 'IDBDatabase', 'IDBRequest', 'IDBTransaction', 'KeyOperation', 'MediaController', 'MessagePort', 'ModalWindow', 'Notification', 'SVGElementInstance', 'Screen', 'TextTrack', 'TextTrackCue', 'TextTrackList', 'WebSocket', 'WebSocketWorker', 'Worker', 'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'XMLHttpRequestUpload'].forEach(function (v) {
        var proto = window[v] && window[v].prototype;
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        var originAddEventListener = proto.addEventListener;
        var originRemoveEventListener = proto.remmoveEventListener;

        proto.addEventListener = function (type, listener, options) {
            var addStack = new Error('Event (' + type + ')').stack;
            var wrappedListener = function wrappedListener() {
                try {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    if (typeof listener.handleEvent != 'undefined') {
                        return listener.handleEvent(args);
                    } else if (typeof listener === 'function') {
                        return listener.apply(this, args);
                    }
                    return listener;
                } catch (error) {
                    error.stack += '\n' + addStack;
                    MiniMonitor.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    });
                }
            };
            return originAddEventListener.call(this, type, wrappedListener, options);
        };
        proto.remmoveEventListener = function (type, listener, options) {
            var wrappedListener = function wrappedListener() {
                try {
                    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        args[_key2] = arguments[_key2];
                    }

                    if (typeof listener.handleEvent != 'undefined') {
                        return listener.handleEvent(args);
                    } else if (typeof listener === 'function') {
                        return listener.apply(this, args);
                    }
                    return listener;
                } catch (error) {
                    MiniMonitor.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    });
                    // throw err
                }
            };
            return originRemoveEventListener.call(this, type, wrappedListener, options);
        };
    });
    if (typeof window.requestAnimationFrame === 'function') {
        var originRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function (callback) {
            var wrappedCallback = function wrappedCallback() {
                try {
                    if (typeof callback === 'function') {
                        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                            args[_key3] = arguments[_key3];
                        }

                        return callback.apply(this, args);
                    }
                    return callback;
                } catch (error) {
                    // throw err
                    MiniMonitor.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    });
                }
            };
            return originRequestAnimationFrame.call(this, wrappedCallback);
        };
    }

    var originSetTimeout = window.setTimeout;
    window.setTimeout = function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        var originCallback = args[0];
        if (originCallback) {
            args[0] = function () {
                try {
                    if (typeof originCallback === 'function') {
                        for (var _len5 = arguments.length, callbackArgs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                            callbackArgs[_key5] = arguments[_key5];
                        }

                        return originCallback.apply(this, callbackArgs);
                    }
                    return originCallback;
                } catch (error) {
                    // throw err
                    MiniMonitor.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    });
                }
            };
        }
        return originSetTimeout.apply(this, args);
    };

    var originSetInterval = window.setInterval;
    window.setInterval = function () {
        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        var originCallback = args[0];
        if (originCallback) {
            args[0] = function () {
                try {
                    if (typeof originCallback === 'function') {
                        for (var _len7 = arguments.length, callbackArgs = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                            callbackArgs[_key7] = arguments[_key7];
                        }

                        return originCallback.apply(this, callbackArgs);
                    }
                    return originCallback;
                } catch (error) {
                    MiniMonitor.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    });
                    // throw err
                }
            };
        }
        return originSetInterval.apply(this, args);
    };
    // Wrapper try/catch for Promise then/catch 
    if (typeof Promise === 'function') {
        ['then', 'catch'].forEach(function (v) {
            var originPromiseMethod = Promise.prototype[v];
            Promise.prototype[v] = function () {
                for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                    args[_key8] = arguments[_key8];
                }

                var successCallback = args[0];
                var failCallback = args[1];
                if (successCallback) {
                    args[0] = function () {
                        try {
                            if (typeof successCallback === 'function') {
                                for (var _len9 = arguments.length, successCallbackArgs = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                                    successCallbackArgs[_key9] = arguments[_key9];
                                }

                                return successCallback.apply(null, successCallbackArgs);
                            }
                            return successCallback;
                        } catch (error) {
                            MiniMonitor.report({
                                type: "crossDominError",
                                message: error.message,
                                url: error.filename,
                                lineNo: error.lineNumber,
                                colNo: error.colNumber,
                                stack: error.stack,
                                errorType: error.name
                            });
                            // throw err
                        }
                    };
                }
                if (failCallback) {
                    args[1] = function () {
                        try {
                            if (typeof failCallback === 'function') {
                                for (var _len10 = arguments.length, failCallbackArgs = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                                    failCallbackArgs[_key10] = arguments[_key10];
                                }

                                return failCallback.apply(null, failCallbackArgs);
                            }
                            return failCallback;
                        } catch (error) {
                            MiniMonitor.report({
                                type: "crossDominError",
                                message: error.message,
                                url: error.filename,
                                lineNo: error.lineno,
                                colNo: error.colno,
                                stack: error.stack,
                                errorType: error.name
                            });
                            // throw err
                        }
                    };
                }
                if (typeof this.then === 'function') {
                    return originPromiseMethod.apply(context, args);
                }
                return originPromiseMethod.apply(null, args);
            };
        });
    }
};

/**
 * @description: 资源加载错误收集构造函数
 * @param {type} 
 * @return
 */
function SourceErrorCol(options) {
    var _this = this;

    this.msgInfoObj = {};
    window.addEventListener && window.addEventListener('error', function (error) {
        if (!(error instanceof ErrorEvent)) {
            // 资源加载错误
            _this.handleError(error);
        }
        return false;
    }, true);
    return this;
}

SourceErrorCol.prototype.handleError = function (error) {
    if (error.message) return;
    var fileType = error.target.tagName,
        resourece,
        outerHTML = (resourece = error.target ? error.target : error.srcElement) && resourece.outerHTML;
    outerHTML && outerHTML.length > 200 && (outerHTML = outerHTML.slice(0, 200));
    this.msgInfoObj = {
        level: 'WARN',
        type: 'resourceError',
        outerHTML: outerHTML,
        errorType: fileType + 'Error',
        url: resourece && resourece.src,
        fileType: fileType.toLowerCase(),
        metaData: {
            id: resourece && resourece.id,
            className: resourece && resourece.className,
            name: resourece && resourece.name,
            type: resourece && resourece.type
        }
    };
    MiniMonitor.report(this.msgInfoObj);
    /* if (this.msgInfoObj.url && window.XMLHttpRequest) {
        var u = new XMLHttpRequest
        u.open('OPTIONS', this.msgInfoObj.url)
        u.send()
        u.onload = function (e) {
            if (e.target.status !== 200) {
                this.msgInfoObj.status = e.target.status === 204 ? 404 : e.target.status
                this.msgInfoObj.statusText = e.target.statusText
                Report.report(this.msgInfoObj)
            }
        }.bind(this)
    } */
    return false;
};

/**
 * @description: Api加载错误收集构造函数
 * @param {type} 
 * @return
 */
function ApiErrorCol(options) {
    var msgInfoObj = {
        type: 'apiError',
        errorType: 'ApiError',
        level: 'WARN'
        // 重写ajax
    };if (typeof window.XMLHttpRequest === 'function') {
        var nativeAjaxSend = XMLHttpRequest.prototype.send;
        var nativeAjaxOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var xhrInstance = this;
            xhrInstance._url = url;

            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = arguments[_key];
            }

            return nativeAjaxOpen.apply(this, [method, url].concat(args));
        };
        XMLHttpRequest.prototype.send = function () {
            var originCb = this.onreadystatechange;
            // const originErrorCb = this.onerror
            var xhrInstance = this;
            xhrInstance.addEventListener('error', function (e) {
                Object.assign(msgInfoObj, {
                    message: 'statusText: ' + e.target.statusText + ';status:' + e.target.status,
                    url: encodeURIComponent(xhrInstance._url)
                });
                MiniMonitor.report(msgInfoObj);
            });
            xhrInstance.addEventListener('abort', function (e) {
                if (e.type === 'abort') {
                    xhrInstance._isAbort = true;
                }
            });
            xhrInstance.onreadystatechange = function () {
                if (xhrInstance.readyState === 4) {
                    if (!xhrInstance._isAbort && xhrInstance.status !== 0 && (xhrInstance.status < 200 || xhrInstance.status >= 400)) {
                        Object.assign(msgInfoObj, {
                            message: 'statusText: ' + xhrInstance.statusText + ';status:' + xhrInstance.status,
                            url: encodeURIComponent(xhrInstance._url)
                        });
                        MiniMonitor.report(msgInfoObj);
                    }
                }

                for (var _len3 = arguments.length, innerArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    innerArgs[_key3] = arguments[_key3];
                }

                originCb && originCb.apply(this, innerArgs);
            };

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return nativeAjaxSend.apply(this, args);
        };
    }
    // 重写fetch
    if (typeof window.fetch === 'function') {
        var oldFetch = window.fetch;
        window.fetch = function () {
            return oldFetch.apply(this, arguments).then(function (res) {
                if (!res.ok) {
                    Object.assign(msgInfoObj, {
                        message: 'statusText:' + res.statusText + ';status:' + res.status,
                        url: res.url
                    });
                    MiniMonitor.report(msgInfoObj);
                }
                return res;
            }).catch(function (err) {
                Object.assign(msgInfoObj, {
                    message: err.message,
                    stack: err
                });
                MiniMonitor.report(msgInfoObj);
            });
        };
    }
}

function VueDebug(Vue) {
    if (typeof Vue === 'undefined') return;
    function formatComponentName(vm) {
        if (vm.$root === vm) return 'root';
        var name = vm._isVue ? vm.$options && vm.$options.name || vm.$options && vm.$options._componentTag : vm.name;
        return (name ? 'component <' + name + '>' : 'anonymous component') + (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '');
    }
    Vue.config.errorHandler = function (err, vm, info) {
        if (vm) {
            var componentName = formatComponentName(vm);
            var propsData = vm.$options && vm.$options.propsData;

            MiniMonitor.report({
                type: 'VueError',
                errorType: err.name,
                message: err.message,
                stack: err.stack,
                filename: componentName,
                metaData: {
                    propsData: propsData
                }
            });
        } else {
            MiniMonitor.report({
                type: 'VueError',
                errorType: err.name,
                message: err.message,
                stack: err.stack,
                metaData: JSON.stringify({
                    vm: vm
                })
            });
        }
    };
}

/**
 * @description: 错误收集构造函数
 * @param {type} 
 * @return
 */
function ErrorCol(options) {
    var _this = this;

    this.msgInfoObj = {};
    // common js error
    if (window.onerror) {
        window.onerror = this.onError.bind(this);
        window.onunhandledrejection = this.promiseError.bind(this);
        window.onrejectionhandled = this.promiseError.bind(this);
    } else {
        window.addEventListener('error', function (e) {
            _this.onError.call(_this, e.message, e.filename, e.lineno, e.colno, e.error);
        }, false);
        window.addEventListener('unhandledrejection', this.promiseError, false);
        window.addEventListener('rejectionhandled', this.promiseError, false);
    }
    return this;
}

/**
 * @description: 收集错误信息
 * @param message: 错误信息（字符串）。可用于HTML onerror=""处理程序中的event。
 * @param source: 发生错误的脚本URL（字符串）
 * @param lineno: 发生错误的行号（数字）
 * @param colno: 发生错误的列号（数字）
 * @param {error}: Error对象
 * @return {void}
 */
ErrorCol.prototype.onError = function (message, source, lineno, colno, error) {
    var toLowerMsg = message.toLowerCase();
    // const errorType = handleErrorType(error)
    if (toLowerMsg.indexOf(crossDominError) === -1) {
        this.msgInfoObj = {
            message: error.message,
            url: source,
            lineNo: lineno,
            colNo: colno,
            stack: error.stack,
            errorType: error.name
        };
        MiniMonitor.report(this.msgInfoObj);
    }
    return false;
};

/**
 * @description: 收集Promise错误信息
 * @return {void}
 */
ErrorCol.prototype.promiseError = function (e) {
    var reason = e.reason;
    this.msgInfoObj = {
        type: e.type,
        message: reason.message,
        stack: reason.stack,
        errorType: reason.name
    };
    MiniMonitor.report(this.msgInfoObj);
    return false;
};

new TryCatch();
new SourceErrorCol();
new ApiErrorCol();
new ErrorCol();
setTimeout(function () {
    if (MiniMonitor.defaultOpt.project) {
        VueDebug(MiniMonitor.defaultOpt.project);
    }
});

module.exports = MiniMonitor;
