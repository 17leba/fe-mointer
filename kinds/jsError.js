import {
    crossDominError
} from './../config'
import Report from './../report'
/**
 * @description: 错误收集构造函数
 * @param {type} 
 * @return
 */
function ErrorCol(options) {
    this.msgInfoObj = {}
    // common js error
    if (window.onerror) {
        window.onerror = this.onError.bind(this)
        window.onunhandledrejection = this.promiseError.bind(this)
        window.onrejectionhandled = this.promiseError.bind(this)

    } else {
        window.addEventListener('error', (e) => {
            this.onError.call(this, e.message, e.filename, e.lineno, e.colno, e.error)
        }, false)
        window.addEventListener('unhandledrejection', this.promiseError, false)
        window.addEventListener('rejectionhandled', this.promiseError, false)
    }
    return this
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
    const toLowerMsg = message.toLowerCase()
    // const errorType = handleErrorType(error)
    if (toLowerMsg.indexOf(crossDominError) === -1) {
        this.msgInfoObj = {
            message: error.message,
            url: source,
            lineNo: lineno,
            colNo: colno,
            stack: error.stack,
            errorType: error.name
        }
        Report.report(this.msgInfoObj)
    }
    return false
}

/**
 * @description: 收集Promise错误信息
 * @return {void}
 */
ErrorCol.prototype.promiseError = function (e) {
    const reason = e.reason
    this.msgInfoObj = {
        type: e.type,
        message: reason.message,
        stack: reason.stack,
        errorType: reason.name
    }
    Report.report(this.msgInfoObj)
    return false
}
export default ErrorCol