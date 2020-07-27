const qsStringify = function (obj) {
    let result = '';
    (function loop(obj) {
        Object.keys(obj).forEach((v, i) => {
            // TODO: array and obj
            if (typeof obj[v] === 'object') {
                loop(obj[v])
            } else {
                // 最后一项没有&
                if (i === Object.keys(obj).length - 1) {
                    result += `${v}=${obj[v]}`
                } else {
                    result += `${v}=${obj[v]}&`
                }
            }
        })
    })(obj)
    return result
}

const handleErrorType = function (err) {
    let errTypeMap = {
            'EvalError': EvalError,
            'RangeError': RangeError,
            'ReferenceError': ReferenceError,
            'SyntaxError': SyntaxError,
            'TypeError': TypeError,
            'URIError': URIError
        },
        result = '';
    for (var i in errTypeMap) {
        if (err instanceof errTypeMap[i]) {
            result = i
        }
    }
    return result
}
export {
    qsStringify,
    handleErrorType
}