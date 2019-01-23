import Taro from '@tarojs/taro';
import * as Api from '../service/apiService';

export default {
  namespace: 'common',
  state: {
    userInfo: null,
    token: Taro.getStorageSync('token'),
    launchInfo: JSON.parse(Taro.getStorageSync('launchInfo') || '{}'),
    wxLoginCode: null,
    cityId: 1720, // 渝水区
  },

  effects: {
    *wxCode(_, { put, select }) {
      let { wxLoginCode } = yield select(state => state.common);
      if (!wxLoginCode) {
        const res = yield Taro.login();
        wxLoginCode = res.code;
        yield put({
          type: 'save',
          payload: {
            wxLoginCode,
          },
        });
      }
      return wxLoginCode;
    },
    *getUserInfo(_) {
      // 需要配合微信button
      const userInfo = yield Taro.getUserInfo({
        lang: 'zh_CN',
        withCredentials: true,
      });
      return userInfo;
    },
    *login({ payload }, { call, put }) {
      const res = yield call(Api.loginByWeixin, payload);
      if (res && res.errno === 0) {
        const { userInfo, token } = res.data;
        Taro.setStorageSync('token', token);
        yield put({
          type: 'save',
          payload: {
            userInfo,
            token,
          },
        });
      } else {
        Taro.showToast({
          title: '登录失败，请重试',
          icon: 'none',
        });
      }
      return res && res.errno === 0;
    },
    *UserInfo({ payload }, { call, put }) {
      const res = yield call(Api.userInfo, payload);
      if (res && res.errno === 0) {
        const userInfo = res.data;
        yield put({
          type: 'save',
          payload: {
            userInfo,
          },
        });
      }
      return res && res.errno === 0;
    },
    *bindPhone({ payload }, { call, put, select }) {
      const res = yield call(Api.bindPhone, payload);
      if (res && res.errno === 0) {
        Taro.setStorageSync('token', res.data.token);
      }
      return res && res.errno === 0;
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
