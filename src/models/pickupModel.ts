import * as Api from '../service/apiService';

export default {
  namespace: 'pickup',
  state: {

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
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },

};
