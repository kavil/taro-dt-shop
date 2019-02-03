import * as Api from '../service/apiService';

export default {
  namespace: 'cart',
  state: {
    cartList: [],
    cartTotal: {},
    couponId: null,
  },

  effects: {
    *Add({ payload }, { call, put }) {
      const res = yield call(Api.addCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
          },
        });
      }
      return res;
    },
    *Index({ payload }, { call, put }) {
      const res = yield call(Api.getCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
          },
        });
      }
      return res;
    },
    *Checkout({ payload }, { call, put }) {
      const res = yield call(Api.checkout, payload);
      yield put({
        type: 'save',
        payload: {
          couponId: res.data.couponId,
        },
      });
      return res.data;
    },
    *Up({ payload }, { call, put }) {
      const res = yield call(Api.postCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
          },
        });
      }
      return res;
    },
    *Del({ payload }, { call, put }) {
      const res = yield call(Api.delCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
          },
        });
      }
      return res;
    },
    *Check({ payload }, { call, put }) {
      const res = yield call(Api.postCheckCart, payload);
      if (res.errno === 0) {
        const { cartList, cartTotal } = res.data;
        yield put({
          type: 'save',
          payload: {
            cartList,
            cartTotal,
          },
        });
      }
      return res;
    },
    *OrderSubmit({ payload }, { call, select }) {
      const { cityId } = yield select(state => state.common);
      const res = yield call(Api.orderSubmit, { ...payload, cityId });
      if (res && res.errno === 0) {
        return res.data;
      }
      return null;
    },
    *Prepay({ payload }, { call }) {
      const res = yield call(Api.prepay, payload);
      if (res && res.errno === 0) {
        return res.data;
      }
      return null;
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
