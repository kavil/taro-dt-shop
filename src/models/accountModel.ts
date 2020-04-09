import Taro from '@tarojs/taro';
import * as Api from '../service/apiService';

export default {
  namespace: 'account',
  state: {
    page: 1,
    size: 10,
    opType: 0,
    loadOver: false,
    refresh: true,
    accountList: []
  },

  effects: {
    *load(_, { call, put }) {
      const res = yield call(Api.accountInfo);
      if (res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            accountInfo: res.data
          }
        });
      }
    },
    *accountList(_, { call, put, select }) {
      const { loadOver, accountList, refresh, page, size, opType } = yield select((state) => state.account);
      if (loadOver) return;

      const res = yield call(Api.accountList, { page, size, opType });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          accountList: refresh ? res.data.data : accountList.concat(res.data.data),
          loadOver: res.data.data.length < size,
          refresh: false
        }
      });
    },
    *accountDetail({ payload }, { call, put }) {
      const res = yield call(Api.accountDetail, { ...payload });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          accountDetail: res.data
        }
      });
    },
    *withdraw({ payload }, { call, put }) {
      const res = yield call(Api.withdraw, { ...payload });
      yield put({
        type: 'save',
        payload: {
          accountInfo: res.data
        }
      });
      return res.errno;
    }
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
