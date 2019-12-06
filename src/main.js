import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入符文本编辑器样式表
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // padStart(长度为多少位,没有就这个数填充)
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const h = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, 0)
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${mm}:${ss}`
})

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
