import Report from './../report'

/**
 * @description: 资源加载错误收集构造函数
 * @param {type} 
 * @return
 */
export function SourceErrorCol(options) {
    this.msgInfoObj = {}
    window.addEventListener && window.addEventListener('error', (error) => {
        if (!(error instanceof ErrorEvent)) {
            // 资源加载错误
            this.handleError(error)
        }
        return false
    }, true)
    return this
}

SourceErrorCol.prototype.handleError = function (error) {
    if (error.message) return
    var fileType = error.target.tagName,
        resourece, outerHTML = (resourece = error.target ? error.target : error.srcElement) && resourece.outerHTML
    outerHTML && outerHTML.length > 200 && (outerHTML = outerHTML.slice(0, 200))
    this.msgInfoObj = {
        level: 'WARN',
        type: 'resourceError',
        outerHTML: outerHTML,
        errorType: `${fileType}Error`,
        url: resourece && resourece.src,
        fileType: fileType.toLowerCase(),
        metaData: {
            id: resourece && resourece.id,
            className: resourece && resourece.className,
            name: resourece && resourece.name,
            type: resourece && resourece.type
        }
    }
    Report.report(this.msgInfoObj)
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
    return false
}