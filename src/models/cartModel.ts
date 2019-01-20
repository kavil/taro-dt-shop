import * as Api from '../service/apiService';

export default {
  namespace: 'cart',
  state: {
    cartList: [],
    cartTotal: {},
    userInfo: {},
  },

  effects: {
    *Add({ payload }, { call, put }) {
      const res = yield call(Api.addCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal, userInfo } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
            userInfo,
          },
        });
      }
      return res.errno === 0;
    },
    *Index({ payload }, { call, put }) {
      const res = yield call(Api.getCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal, userInfo } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
            userInfo,
          },
        });
      }
      return res.errno === 0;
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
