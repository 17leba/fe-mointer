import Report from './../report'

/**
 * @description: Api加载错误收集构造函数
 * @param {type} 
 * @return
 */
export function ApiErrorCol (options){
    const msgInfoObj = {
        type: 'apiError',
        errorType: 'ApiError',
        level: 'WARN'
    }
    // 重写ajax
    if(typeof window.XMLHttpRequest === 'function'){
        const nativeAjaxSend = XMLHttpRequest.prototype.send
        const nativeAjaxOpen = XMLHttpRequest.prototype.open
        XMLHttpRequest.prototype.open = function(method, url, ...args){
            const xhrInstance= this
            xhrInstance._url = url;
            return nativeAjaxOpen.apply(this, [method, url].concat(args))
        } 
        XMLHttpRequest.prototype.send = function(...args){
            const originCb = this.onreadystatechange
            // const originErrorCb = this.onerror
            const xhrInstance = this
            xhrInstance.addEventListener('error', function(e){
                Object.assign(msgInfoObj, {
                    message: `statusText: ${e.target.statusText};status:${e.target.status}`,
                    url: encodeURIComponent(xhrInstance._url)
                })
                Report.report(msgInfoObj)
            })
            xhrInstance.addEventListener('abort', function(e){
                if(e.type === 'abort'){
                    xhrInstance._isAbort = true
                }
            })
            xhrInstance.onreadystatechange = function(...innerArgs){
                if(xhrInstance.readyState === 4){
                    if(!xhrInstance._isAbort && xhrInstance.status !== 0 && (xhrInstance.status < 200 || xhrInstance.status >= 400)){
                        Object.assign(msgInfoObj, {
                            message: `statusText: ${xhrInstance.statusText};status:${xhrInstance.status}`,
                            url: encodeURIComponent(xhrInstance._url)
                        })
                        Report.report(msgInfoObj)
                    }
                }
                originCb && originCb.apply(this, innerArgs)
            }
            return nativeAjaxSend.apply(this,args)
        }
    }
    // 重写fetch
    if(typeof window.fetch === 'function'){
        const oldFetch = window.fetch
        window.fetch = function(){
            return oldFetch.apply(this, arguments).then(res => {
                if(!res.ok){
                    Object.assign(msgInfoObj, {
                        message: `statusText:${res.statusText};status:${res.status}`,
                        url: res.url
                    })
                    Report.report(msgInfoObj)
                }
                return res
            }).catch(err => {
                Object.assign(msgInfoObj, {
                    message: err.message,
                    stack: err
                })
                Report.report(msgInfoObj)
            })
        }
    }
    
}