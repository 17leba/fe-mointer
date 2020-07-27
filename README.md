### 如何使用？
```
yarn add report-fe@git@github.com:17leba/fe-monitor.git
import ExceptionReport from 'report-fe'
ExceptionReport({
    env: 'test', （可选，无此参数则上报到线上地址）
    appKey: '项目名称',
    project: Vue/React,（可选，React和Vue项目需要）
    rate: '上报频率（type: number）'
})
```

#### TODO