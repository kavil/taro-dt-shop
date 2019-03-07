import * as Api from '../service/apiService';

export default {
  namespace: 'neighbor',
  state: {
    NearbyList: [],
    SearchList: [],
  },

  effects: {
    *NearbyList({ payload }, { call, put }) {
      const res = yield call(Api.nearbyList, payload);
      if (res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            NearbyList: res.data,
          },
        });
      }
    },
    *Search({ payload }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          SearchList: [],
        },
      });
      const res = yield call(Api.communitySearch, payload);
      if (res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            SearchList: res.data,
          },
        });
      }
    },
    *Bind({ payload }, { call, put }) {
      const res = yield call(Api.communityBind, payload);
      return res.errno === 0
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
