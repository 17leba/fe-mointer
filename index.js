import MiniMonitor from './report'
import ErrorCol, {
    TryCatch,
    SourceErrorCol,
    ApiErrorCol,
    VueDebug, 
    ReactDebug
    // Caton
} from './kinds'

new TryCatch()
new SourceErrorCol()
new ApiErrorCol()
new ErrorCol()
setTimeout(() => {
    if(MiniMonitor.defaultOpt.project){
        VueDebug(MiniMonitor.defaultOpt.project) 
        ReactDebug()
    }
})
// new Caton()
export default MiniMonitor