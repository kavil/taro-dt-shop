import * as Api from '../service/apiService';

export default {
  namespace: 'shop',
  state: {},

  effects: {
    *List({ payload }, { call, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getShopList, { ...payload, cityId });
      if (res.errno !== 0) return null;
      return res.data;
    },
    *ProductList({ payload }, { call, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getProductList, { ...payload, cityId });
      if (res.errno !== 0) return null;
      return res.data;
    },

    *Detail({ payload }, { call, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getShopDetail, { ...payload, cityId });
      if (res.errno !== 0) return null;
      return res.data;
    },

    *ProductDetail({ payload }, { call, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getShopProductDetail, { ...payload, cityId });
      if (res.errno !== 0) return null;
      return res.data;
    },
    *ApplyAction({ payload }, { call, select }) {
      const res = yield call(Api.applyAction, payload);
      if (res.errno !== 0) return null;
      return res.data;
    }
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    clearDetail(state) {
      return { ...state, Detail: {} };
    }
  }
};
