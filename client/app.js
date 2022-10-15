import Vue from "vue";
import App from "../src/App.vue";
import { createRouter } from "../src/router";
import { createStore } from "../src/store";
import { sync } from "vuex-router-sync";
import { Button } from 'view-design'
import 'view-design/dist/styles/iview.css'

Vue.component('Button', Button)
// 解决 [vue-router] fail to resolve async component default
if (typeof window === 'undefined') {
  global.window = {}
}
export function createApp(context) {
  const router = createRouter();
  const store = createStore();
  // 同步路由状态
  sync(store, router);
  const app = new Vue({
    router,
    store,
    render: h => h(App),
  });
  return { app, router, store };

}