import * as Api from '../service/apiService';
import Taro from '@tarojs/taro';

export default {
  namespace: 'ucenter',
  state: {
    couponList: [],
    card: {
      page: 1,
      size: 20,
      used: false,
      loadOver: false,
      refresh: true,
      cardList: [],
    },
    ShopUser: {
      page: 1,
      size: 20,
      type: 0,
      loadOver: false,
      refresh: true,
      List: [],
    }
  },

  effects: {
    *Coupon({ payload }, { call, put }) {
      const res = yield call(Api.getCoupon, { payload });
      if (res.errno === 0) {
        yield put({
          type: 'save',
          payload: {
            couponList: res.data,
          },
        });
      }
    },

    *Card(_, { call, put, select }) {
      const { card } = yield select(state => state.ucenter);
      const { loadOver, cardList, refresh, page, size, used } = card;
      if (loadOver) return;

      const res = yield call(Api.getCard, { page, size, used });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          card: {
            ...card,
            cardList: refresh ? res.data.data : cardList.concat(res.data.data),
            loadOver: res.data.data.length < size,
            refresh: false,
          }
        },
      });
    },
    *CardCheckOut({ payload }, { call }) {
      const res = yield call(Api.cardCheckOut, payload);
      if (res.errno === 0) {
        return res.data;
      }
      return null;
    },

    *CardcheckIt({ payload }, { call }) {
      const res = yield call(Api.cardCheckIt, payload);
      console.log(payload, 'CardcheckIt');
      
      if (res.errno === 0) {
        return res.data;
      }
      return null;
    },


    *ShopUser(_, { call, put, select }) {
      const { ShopUser } = yield select(state => state.ucenter);
      const { loadOver, List, refresh, page, size, type } = ShopUser;
      if (loadOver) return;

      const res = yield call(Api.shopUser, { page, size, type });
      Taro.stopPullDownRefresh();

      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          ShopUser: {
            ...ShopUser,
            List: refresh ? res.data.data : List.concat(res.data.data),
            loadOver: res.data.data.length < size,
            refresh: false,
          }
        },
      });
    },


  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
