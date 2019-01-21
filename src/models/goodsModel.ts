import * as Api from '../service/apiService';

export default {
  namespace: 'goods',
  state: {
    cateList: [],
    List: {},
    Detail: {},
  },

  effects: {
    *getCate(_, { call, put, select }) {
      const { cityId } = yield select(state => state.common);
      const res = yield call(Api.getCate, { cityId });
      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          cateList: res.data,
        },
      });
    },
    *List({ payload }, { call, put, select }) {
      let { List } = yield select(state => state.goods);
      if (!List[payload.listName]) {
        List[payload.listName] = {
          // 初始化
          listName: payload.listName,
          list: [],
          page: 1,
          size: 10,
          parent_id: null,
          goods_name: null,
          ...payload,
        };
      } else {
        List[payload.listName] = {
          ...List[payload.listName],
          ...payload,
        };
      }
      const { cityId } = yield select(state => state.common);

      let { list, loadOver, refresh, page, size, parent_id, promot_cate_id, goods_name } = List[
        payload.listName
      ];
      if (loadOver) return;
      if (refresh) page = 1;
      const res = yield call(Api.getGoodsList, {
        cityId,
        page,
        size,
        parent_id,
        promot_cate_id,
        goods_name,
      });
      if (res.errno !== 0) return;
      list = refresh ? res.data.data : list.concat(res.data.data);
      page++;
      loadOver = res.data.data.length < size;
      refresh = false;

      yield put({
        type: 'save',
        payload: {
          List: {
            ...List,
            [payload.listName]: {
              list,
              loadOver,
              refresh,
              page,
              size,
              parent_id,
              promot_cate_id,
              goods_name,
            },
          },
        },
      });
    },
    *Detail({ payload }, { call, put, select }) {
      const { cityId } = yield select(state => state.common);
      const res = yield call(Api.getGoodsDetail, { ...payload, cityId });
      if (res.errno !== 0) return null;
      yield put({
        type: 'save',
        payload: {
          Detail: res.data,
        },
      });
      return res.data;
    },
    *Sku({ payload }, { call }) {
      const res = yield call(Api.getSku, { ...payload });
      if (res.errno !== 0) return null;
      return res.data;
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    clearDetail(state) {
      return { ...state, Detail: {} };
    },
  },
};
