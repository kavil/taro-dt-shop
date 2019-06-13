import * as Api from '../service/apiService';
import Taro from '@tarojs/taro';

export default {
  namespace: 'pickup',
  state: {
    page: 1,
    size: 10,
    loadOver: false,
    refresh: true,
    checkRecordList: [],
  },

  effects: {
    * getcodeInfo({ payload }, { call, put }) {
      const res = yield call(Api.getcodeInfo, { ...payload });
      if (res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            getcodeInfo: res.data
          }
        });
      }
      return res.errno === 0;
    },
    * getcodeUse({ payload }, { call }) {
      const res = yield call(Api.getcodeUse, { ...payload });
      return res.errno === 0;
    },

    *CheckRecordList(_, { call, put, select }) {
      const { loadOver, checkRecordList, refresh, page, size, opType } = yield select(
        state => state.pickup
      );
      if (loadOver) return;

      const res = yield call(Api.checkRecordList, { page, size, opType });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          checkRecordList: refresh ? res.data.data : checkRecordList.concat(res.data.data),
          loadOver: res.data.data.length < size,
          refresh: false,
        },
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },

};
