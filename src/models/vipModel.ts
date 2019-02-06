import * as Api from '../service/apiService';

export default {
  namespace: 'vip',
  state: {
    vipOpenDays: null,
  },

  effects: {
    *OpenDays(_, { call, put }) {
      const res = yield call(Api.vipOpenDays);
      if (res && res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            vipOpenDays: res.data,
          },
        });
        return res.data;
      }
      return null;
    },
    *Prepay({ payload }, { call, put }) {
      const res = yield call(Api.vipPrepay, payload);
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
