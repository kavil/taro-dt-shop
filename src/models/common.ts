import Taro from '@tarojs/taro';
import * as Api from '../service/apiService';

export default {
  namespace: 'common',
  state: {
    token: Taro.getStorageSync('token'),
    userInfo: Taro.getStorageSync('userInfo'),
    launchInfo: JSON.parse(Taro.getStorageSync('launchInfo') || '{}'),
    wxLoginCode: null,
    cityId: 163,
  },

  effects: {
    *wxCode(_, { put, select }) {
      let { wxLoginCode } = yield select(state => state.common);
      if (!wxLoginCode) {
        const res = yield Taro.login();
        wxLoginCode = res.code;
        put({
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
    *login({ payload }, { call }) {
      const res = yield call(Api.loginByWeixin, payload);
      if (res && res.errno === 0) {
        Taro.setStorageSync('userInfo', res.data.userInfo);
        Taro.setStorageSync('token', res.data.token);
      } else {
        Taro.showToast({
          title: '登录失败，请重试',
          icon: 'none',
        });
      }
      return res && res.errno === 0;
    },
    *bindPhone({ payload }, { call, put, select }) {
      const res = yield call(Api.bindPhone, payload);
      if (res && res.errno === 0) {
        Taro.setStorageSync('userInfo', res.data.userInfo);
        Taro.setStorageSync('token', res.data.token);
      }
      return res && res.errno === 0;
    },
    *loadColonelInfo({ payload }, { call, put, select }) {
      const res = yield call(Api.colonelInfo, payload);
      Taro.stopPullDownRefresh();
      if (res.errno === 0 && res.data.id) {
        yield put({
          type: 'save',
          payload: {
            colonelInfo: res.data,
            communityList: res.data.community,
            manage: res.data.manage,
          },
        });
        const curCommunity = yield select(state => state.common.curCommunity);

        if (!curCommunity && res.data.community.length) {
          Taro.setStorageSync('curCommunity', res.data.community[0].id);
        }
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
