import Report from './../report'
const myWorker = new Worker('./worker.js')

function Crash(){
    // if(navigator.serviceWorker){

    // }
    // if(navigator.serviceWorker.controller){
    //     const heartbeatInterval = 5000
    //     const pageSessionId = uuid()
    //     let heartbeat = function(){
    //         navigator.serviceWorker.controller.postMessage({
    //             type: 'heartbeat',
    //             id: pageSessionId,
    //             data: {
    //                 url: window.location.href,
    //                 type: 'performance',
    //                 message: '当前页面崩溃，请检查'
    //             }
    //         })
    //     }
    //     window.addEventListener('beforeunload', function(){
    //         navigator.serviceWorker.controller.postMessage({
    //             type: 'unload',
    //             id: pageSessionId
    //         })
    //     })
    //     setInterval(heartbeat, heartbeatInterval)
    //     heartbeat()
    // }

}

export function Caton(){
    if(typeof performance === 'object') {
        let lastTime = performance.now()
        let frame = 0
        let lastFameTime = performance.now()
        let fpsList = []
        let loop = function(time){
            let now = performance.now()
            let fs = now - lastFameTime
            lastFameTime = now
            let fps = Math.round(1000 / fs)
            frame++
            if(now > 1000 + lastTime){
                fps = Math.round((frame * 1000) /  (now - lastTime))
                frame = 0
                lastTime = now
                fpsList.push(fps)

                myWorker.postMessage([fpsList])
            }
            window.requestAnimationFrame(loop)
        }
        // init
        loop()
        myWorker.onmessage = function(e){
            const data = e.data
            if(data.status){
                // report
                Report.report({
                    type: 'performance',
                    url: window.location.href,
                    message: '当前页面有阻塞，请排查'
                })
            }else if(data.fpsList.length === 300){
                // storage local
            }
        }
    }
    return this
}