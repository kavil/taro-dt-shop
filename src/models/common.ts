import Taro from '@tarojs/taro';
import * as Api from '../service/apiService';

export default {
  namespace: 'common',
  state: {
    userInfo: {},
    token: Taro.getStorageSync('token'),
    launchInfo: JSON.parse(Taro.getStorageSync('launchInfo') || '{}'),
    wxLoginCode: null,
    cityId: 1720, // 渝水区
    uploadSign: {},
    formIdArr: [],
  },

  effects: {
    *spread({ payload }, { call }) {
      const res = yield call(Api.spread, payload);
      if (res && res.errno === 0) {
        return res.data;
      }
      return [];
    },
    *formId(_, { call, select, put }) {
      const { formIdArr } = yield select(state => state.common);
      if (!formIdArr.length) return null;
      formIdArr.forEach(ele => {
        ele.exTime = 7 * 24 * 3600 - (Math.floor(new Date().getTime() / 1000) - ele.createdTime);
      });
      const res = yield call(Api.formId, { formIdArr });
      if (res && res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            formIdArr: [],
          },
        });
        return res.data;
      }
      return null;
    },
    *wxCode(_, {}) {
      // let { wxLoginCode } = yield select(state => state.common);
      // if (!wxLoginCode) {
      const res = yield Taro.login();
      const wxLoginCode = res.code;
      // yield put({
      //   type: 'save',
      //   payload: {
      //     wxLoginCode,
      //   },
      // });
      // }
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
    // *CityOpenName({ payload }, { call, select }) {
    //   let cityOpen = Taro.getStorageSync('cityOpen');
    //   const { cityId } = yield select(state => state.common);
    //   if (cityOpen && cityOpen[cityId]) {
    //     return cityOpen[cityId];
    //   } else {
    //     const res = yield call(Api.cityOpen, payload);
    //     if (res && res.errno === 0) {
    //       cityOpen = res.data;
    //       Taro.setStorageSync('cityOpen', cityOpen);
    //       return cityOpen[cityId];
    //     }
    //   }
    // },
    *BindPhone({ payload }, { call, put, select }) {
      // const { wxLoginCode } = yield select(state => state.common);
      const res = yield call(Api.bindPhone, { ...payload, code: (yield Taro.login()).code });
      if (res && res.errno === 0) {
        const { userInfo } = yield select(state => state.common);
        yield put({
          type: 'save',
          payload: {
            userInfo: { ...userInfo, mobile: res.data },
          },
        });
        console.log(userInfo, { ...userInfo, mobile: res.data });
      }
      return res;
    },
    *UploadSign(_, { call, put, select }) {
      let { uploadSign } = yield select(state => state.common);
      if (!uploadSign.expire)
        uploadSign = JSON.parse(
          Taro.getStorageSync('uploadSign') ? Taro.getStorageSync('uploadSign') : '{}'
        );
      if (uploadSign.expire > new Date().getTime() / 1000) {
        return uploadSign;
      }
      const res = yield call(Api.uploadSign);
      yield put({
        type: 'save',
        payload: { uploadSign: res.data },
      });
      Taro.setStorageSync('uploadSign', JSON.stringify(res.data));
      return res.data;
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
