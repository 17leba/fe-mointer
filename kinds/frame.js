import Report from './../report'

function VueDebug (Vue){
    if(typeof Vue === 'undefined') return
    function formatComponentName(vm){
        if(vm.$root === vm) return 'root'
        let name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name
        return (
            (name ? `component <${name}>`: 'anonymous component') +
            (vm._isVue && vm.$options && vm.$options.__file ? ' at '+(vm.$options && vm.$options.__file) : '')
        )
    }
    Vue.config.errorHandler = function(err, vm, info){
        if(vm){
            let componentName = formatComponentName(vm)
            let propsData = vm.$options && vm.$options.propsData
            
            Report.report({
                type: 'VueError',
                errorType: err.name,
                message: err.message,
                stack: err.stack,
                filename: componentName,
                metaData: {
                    propsData
                }
            })
        }else{
            Report.report({
                type: 'VueError',
                errorType: err.name,
                message: err.message,
                stack: err.stack,
                metaData: JSON.stringify({
                    vm: vm
                })
            })
        }
    }
}

const ReactDebug = errorInfo => WrapComponent => {
    if(typeof React === 'undefined') return
    return class ErrorBoundary extends React.Component {
        constructor(props){
            super(props)
            this.state = {
                hasError: false
            }
        }
        static getDerivedStateFromError(error){
            return {
                hasError: true
            }
        }
        componentDidCatch(error, info){
            Report.report({
                type: 'ReactError',
                message: info,
                stack: error
            })
        }
        render (){
            if(this.state.hasError){
                return { errorInfo }
            }
            return WrapComponent
        }
    }
}
// @ReactDebug('it is a error')
export {
    VueDebug,
    ReactDebug
}