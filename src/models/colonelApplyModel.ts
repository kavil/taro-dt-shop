import * as Api from '../service/apiService';

export default {
  namespace: 'colonel',
  state: {},

  effects: {
    *Apply({ payload }, { call, select }) {
      const { cityId } = yield select(state => state.common);
      const res = yield call(Api.colonelApply, { ...payload, cityId });
      return res.errno === 0;
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
