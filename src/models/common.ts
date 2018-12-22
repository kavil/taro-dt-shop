import Taro from '@tarojs/taro';
import * as Api from '../service/apiService';

export default {
    namespace: 'common',
    state: {
        token: Taro.getStorageSync('token'),
        userInfo: Taro.getStorageSync('userInfo'),
        launchInfo: JSON.parse(Taro.getStorageSync('launchInfo') || '{}'),
        manage: 0
    },

    effects: {
        * getColonelName(_, { call, put, select }) {
            const res = yield call(Api.getColonelName, yield select(state => state.common.launchInfo));
            if (res.errno === 0) {
                yield put({
                    type: 'save',
                    payload: {
                        colonelName: res.data,
                    }
                });
            }
        },
        * bindPhone({ payload }, { call, put, select }) {
            const res = yield call(Api.bindPhone, payload);
            if (res && (res.errno === 0)) {
                Taro.setStorageSync('userInfo', res.data.userInfo);
                Taro.setStorageSync('token', res.data.token);
            }
            return res && (res.errno === 0);
        },
        * loadColonelInfo({ payload }, { call, put, select }) {
            const res = yield call(Api.colonelInfo, payload);
            Taro.stopPullDownRefresh();
            if (res.errno === 0 && res.data.id) {
                yield put({
                    type: 'save',
                    payload: {
                        colonelInfo: res.data,
                        communityList: res.data.community,
                        manage: res.data.manage
                    }
                });
                const curCommunity = yield select(state => state.common.curCommunity);

                if (!curCommunity && res.data.community.length) {
                    Taro.setStorageSync('curCommunity', res.data.community[0].id)
                }
            }
        },
    },

    reducers: {
        save(state, { payload }) {
            return { ...state, ...payload };
        },
        switchEwm(state) {
            const ewmStatus = !state.ewmStatus;
            return { ...state, ...{ ewmStatus } };
        },
    },

};
