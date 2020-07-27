import {
    reportUrl,
    reportUrlTest,
    whiteHostList
} from './../config'
import {
    qsStringify,
} from './../utils'

function Report(options) {
    this.defaultOpt = {
        reportUrl: reportUrl,
        rate: 100,
        referer: window.location.href,
        level: 'ERROR'
    }
}

Report.prototype.init = function (options) {
    if (!options.appKey) {
        console.error('appKey不能为空')
        return
    }
    if (options.env === 'test') {
        Object.assign(this.defaultOpt, {
            reportUrl: reportUrlTest
        })
    }
    
    Object.assign(this.defaultOpt, options)
}
/**
 * @description: 上报日志
 * @param {type} 
 * @return: 
 */
Report.prototype.report = function (options) {
    if (!this.defaultOpt.appKey) {
        console.error('appKey不能为空')
        return
    }
    if (this.defaultOpt.env !== 'test' && whiteHostList.indexOf(window.location.host) === -1) {
        return
    }
    if (window.sessionStorage) {
        const preTime = window.sessionStorage.getItem('preReportTime')
        const preReportMsg = window.sessionStorage.getItem('preReportMsg')
        if (preTime && preReportMsg) {
            // 间隔小于1s，则不上报
            if ((+new Date - +preTime) <= 1000 && preReportMsg == options.message) {
                return
            }
            window.sessionStorage.setItem('preReportTime', +new Date)
            window.sessionStorage.setItem('preReportMsg', options.message)
        } else {
            window.sessionStorage.setItem('preReportTime', +new Date)
            window.sessionStorage.setItem('preReportMsg', options.message)
        }
    }
    const reportParams = {}
    Object.assign(reportParams, this.defaultOpt, options)
    const rate = Math.random() * 100
    if (rate < this.defaultOpt.rate) {
        this.compatibleHandle(reportParams)
    }
    // window.onload = window.onunload = function (event){
    // }.bind(this)
}
/**
 * @description: 统一兼容
 * @param {options}:  
 * @return: 
 */
Report.prototype.compatibleHandle = function (options) {
    if (navigator.sendBeacon) {
        let data = JSON.stringify(options)
        /* let blob = new Blob([data], {
            type: 'application/json; charset=UTF-8'
        }) */
        navigator.sendBeacon(`${options.reportUrl}/report`, data)
    } else {
        let image = new Image()
        image.src = `${options.reportUrl}/report.gif?${qsStringify(options)}`
    }

}
window.MiniMonitor = new Report()
export default MiniMonitor