import * as Api from '../service/apiService';
import Taro from '@tarojs/taro';

export default {
  namespace: 'score',
  state: {
    page: 1,
    size: 10,
    opType: 0,
    loadOver: false,
    refresh: true,
    scoreList: []
  },

  effects: {
    *ScoreList(_, { call, put, select }) {
      const { loadOver, scoreList, refresh, page, size, opType } = yield select((state) => state.score);
      if (loadOver) return;

      const res = yield call(Api.scoreList, { page, size, opType });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          scoreList: refresh ? res.data.data : scoreList.concat(res.data.data),
          loadOver: res.data.data.length < size,
          refresh: false
        }
      });
    }
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
