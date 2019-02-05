import * as Api from '../service/apiService';

export default {
  namespace: 'ucenter',
  state: {
    couponList: [],
  },

  effects: {
    *Coupon({ payload }, { call, put }) {
      const res = yield call(Api.getCoupon, { payload });
      if (res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            couponList: res.data,
          },
        });
      }
    },
    *VipSave(_, { call, put }) {
      const res = yield call(Api.vipSave);
      if (res.errno === 0) {
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
