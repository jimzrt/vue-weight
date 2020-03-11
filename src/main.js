import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import axios from "axios";
//import VueLodash from 'vue-lodash'
//import chunk from 'lodash/chunk'
import VueSweetalert2 from 'vue-sweetalert2';

import { parseISO, format } from 'date-fns'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'sweetalert2/dist/sweetalert2.min.css';

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

//Vue.use(VueLodash, { lodash: { chunk } })

Vue.use(VueSweetalert2);

Vue.filter('formatDate', function(date) {
  if (date) {
    return format(
      parseISO(date),
      'dd.MM.yyyy - HH:mm'
    )
  }
})

Vue.filter('formatDateObject', function(date) {
  if (date) {
    return format(
      date,
      'dd.MM.yyyy - HH:mm'
    )
  }
})

Vue.config.productionTip = false
Vue.prototype.$http = axios
new Vue({
  render: h => h(App),
}).$mount('#app')
