onmessage = function(e){
    if(e.data[0] && e.data[0].length){
        let status = isBlocking(e.data[0])
        postMessage({
            status: status,
            fpsList: e.data[0]
        })
    }
}

isBlocking = function(fpsList, fpsBelow = 20, limit = 3){
    let count = 0
    for(let i = 0; i < fpsList.length; i++){
        if(fpsList[i] && fpsList[i] < fpsBelow){
            count++
        }else{
            count = 0
        }
        if(count > limit){
            return true
        }
    }
    return false
}