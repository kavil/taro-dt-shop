import * as Api from '../service/apiService';

export default {
  namespace: 'deliver',
  state: {
  },

  effects: {
    * Community({ payload }, { call, select }) {
      const { cityId } = yield select(state => state.common);
      const res = yield call(Api.deliverCommunity, { ...payload, cityId });
      if (res.errno === 0) {
        return res.data;
      }
      return []
    },
    * Setline({ payload }, { call }) {
      const res = yield call(Api.deliverSetline, payload);
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
