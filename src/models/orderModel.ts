import * as Api from '../service/apiService';
import Taro from '@tarojs/taro';

export default {
  namespace: 'order',
  state: {
    page: 1,
    size: 10,
    status: undefined,
    loadOver: false,
    refresh: true,
    search: undefined,
    orderList: [],
  },

  effects: {
    * orderList(_, { call, put, select }) {
      const { loadOver, orderList, refresh, page, size, status, search } = yield select(state => state.order);
      console.log(loadOver, 'loadOver');
      
      if (loadOver) return;

      const res = yield call(Api.orderList, { page, size, status, search });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          orderList: refresh ? res.data.data : orderList.concat(res.data.data),
          loadOver: res.data.data.length < size,
          refresh: false,
        }
      });
    },
    * statusChange({ payload }, { call, put, select }) {

      const res = yield call(Api.orderStatusChange, payload);
      return res.errno == 0;
    },

  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },

};
