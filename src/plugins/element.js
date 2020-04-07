import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'
// element  ui框架 按需导入组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 导入弹框提示组件
Vue.prototype.$message = Message
