import Vue from 'vue'
import { Form, FormItem, Input, Button, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message 需要挂载在vue的原型对象上
Vue.prototype.$message = Message
