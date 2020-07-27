import Report from './../report'

export const TryCatch = function () {
    [
        'EventTarget',
        'Window',
        'Node',
        'ApplicationCache',
        'AudioTrackList',
        'ChannelMergerNode',
        'CryptoOperation',
        'EventSource',
        'FileReader',
        'HTMLUnknownElement',
        'IDBDatabase',
        'IDBRequest',
        'IDBTransaction',
        'KeyOperation',
        'MediaController',
        'MessagePort',
        'ModalWindow',
        'Notification',
        'SVGElementInstance',
        'Screen',
        'TextTrack',
        'TextTrackCue',
        'TextTrackList',
        'WebSocket',
        'WebSocketWorker',
        'Worker',
        'XMLHttpRequest',
        'XMLHttpRequestEventTarget',
        'XMLHttpRequestUpload'
    ].forEach(v => {
        const proto = window[v] && window[v].prototype
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return
        }
        const originAddEventListener = proto.addEventListener
        const originRemoveEventListener = proto.remmoveEventListener

        proto.addEventListener = function (type, listener, options) {
            const addStack = new Error(`Event (${type})`).stack;
            const wrappedListener = function (...args) {
                try {
                    if(typeof listener.handleEvent != 'undefined'){
                        return listener.handleEvent(args)
                    }else if(typeof listener === 'function'){
                        return listener.apply(this, args)
                    }
                    return listener
                } catch (error) {
                    error.stack += `\n` + addStack
                    Report.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    })
                }
            }
            return originAddEventListener.call(this, type, wrappedListener, options)
        }
        proto.remmoveEventListener = function (type, listener, options) {
            const wrappedListener = function (...args) {
                try {
                    if(typeof listener.handleEvent != 'undefined'){
                        return listener.handleEvent(args)
                    }else if(typeof listener === 'function'){
                        return listener.apply(this, args)
                    }
                    return listener
                } catch (error) {
                    Report.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    })
                    // throw err
                }
            }
            return originRemoveEventListener.call(this, type, wrappedListener, options)
        }
    })
    if (typeof window.requestAnimationFrame === 'function') {
        const originRequestAnimationFrame = window.requestAnimationFrame
        window.requestAnimationFrame = function (callback) {
            const wrappedCallback = function (...args) {
                try {
                    if(typeof callback === 'function'){
                        return callback.apply(this, args)
                    }
                    return callback
                } catch (error) {
                    // throw err
                    Report.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    })
                }
            }
            return originRequestAnimationFrame.call(this, wrappedCallback)
        }
    }

    const originSetTimeout = window.setTimeout
    window.setTimeout = function (...args) {
        const originCallback = args[0]
        if (originCallback) {
            args[0] = function (...callbackArgs) {
                try {
                    if(typeof originCallback === 'function'){
                        return originCallback.apply(this, callbackArgs)
                    }
                    return originCallback
                } catch (error) {
                    // throw err
                    Report.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    })
                }
            }
        }
        return originSetTimeout.apply(this, args)
    }

    const originSetInterval = window.setInterval
    window.setInterval = function (...args) {
        const originCallback = args[0]
        if (originCallback) {
            args[0] = function (...callbackArgs) {
                try {
                    if(typeof originCallback === 'function'){
                        return originCallback.apply(this, callbackArgs)
                    }
                    return originCallback
                } catch (error) {
                    Report.report({
                        type: "crossDominError",
                        message: error.message,
                        url: error.filename,
                        lineNo: error.lineno,
                        colNo: error.colno,
                        stack: error.stack,
                        errorType: error.name
                    })
                    // throw err
                }
            }
        }
        return originSetInterval.apply(this, args)
    }
    // Wrapper try/catch for Promise then/catch 
    if (typeof Promise === 'function') {
        [
            'then',
            'catch'
        ].forEach(v => {
            const originPromiseMethod = Promise.prototype[v]
            Promise.prototype[v] = function (...args) {
                const successCallback = args[0]
                const failCallback = args[1]
                if (successCallback) {
                    args[0] = function (...successCallbackArgs) {
                        try {
                            if(typeof successCallback === 'function'){
                                return successCallback.apply(null, successCallbackArgs)
                            }
                            return successCallback
                        } catch (error) {
                            Report.report({
                                type: "crossDominError",
                                message: error.message,
                                url: error.filename,
                                lineNo: error.lineNumber,
                                colNo: error.colNumber,
                                stack: error.stack,
                                errorType: error.name
                            })
                            // throw err
                        }
                    }
                }
                if (failCallback) {
                    args[1] = function (...failCallbackArgs) {
                        try {
                            if(typeof failCallback === 'function'){
                                return failCallback.apply(null, failCallbackArgs)
                            }
                            return failCallback
                        } catch (error) {
                            Report.report({
                                type: "crossDominError",
                                message: error.message,
                                url: error.filename,
                                lineNo: error.lineno,
                                colNo: error.colno,
                                stack: error.stack,
                                errorType: error.name
                            })
                            // throw err
                        }
                    }
                }
                if(typeof this.then === 'function'){
                    return originPromiseMethod.apply(context, args)
                }
                return originPromiseMethod.apply(null, args)
            }
        })
    }
}