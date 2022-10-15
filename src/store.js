import Vue from "vue";
import Vuex from "vuex";
import { fetchData, changeData } from "./api";
Vue.use(Vuex);
export function createStore() {
  return new Vuex.Store({
    state: {
      first: "first",
      second: 'second',
      third: "third",
    },
    actions: {
      fetchData({ commit }, key) {
        return fetchData(key).then((res) => {
          commit(('setData'), { key, data: res.data.data });
        })
      },
      changeData({ commit }) {
        return changeData().then((res) => {
          commit('changeData', { data: res.data.data });
        })
      }
    },
    mutations: {
      setData(state, { key, data }) {
        state[key] = data;
      },
      changeData(state, { data }) {
        state.first = data.first;
        state.two = data.two;
        state.three = data.three;
      }
    }
  })
}
