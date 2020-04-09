import * as Api from '../service/apiService';

export default {
  namespace: 'goods',
  state: {
    cateList: [],
    List: {},
    Detail: {},
    SearchList: [],
    startTime: '',
    endTime: '',
    title: '',
    mspTime: [
      { start: '10:00', end: '11:00' },
      { start: '16:00', end: '17:00' },
      { start: '20:00', end: '21:00' }
    ]
  },

  effects: {
    *getCate(_, { call, put, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getCate, { cityId });
      if (res.errno !== 0) return;
      yield put({
        type: 'save',
        payload: {
          cateList: res.data.list,
          startTime: res.data.startTime,
          endTime: res.data.endTime,
          title: res.data.title
        }
      });
    },
    *List({ payload }, { call, put, select }) {
      let { List } = yield select((state) => state.goods);
      if (!List[payload.listName]) {
        List[payload.listName] = {
          // 初始化
          listName: payload.listName,
          list: [],
          page: 1,
          size: 20,
          parent_id: null,
          goods_name: null,
          goods_type: null,
          ...payload
        };
      } else {
        List[payload.listName] = {
          ...List[payload.listName],
          ...payload
        };
      }
      const { cityId } = yield select((state) => state.common);

      let { list, loadOver, refresh, page, size, parent_id, promot_cate_id, goods_name, goods_type } = List[payload.listName];
      if (loadOver) return;
      if (refresh) page = 1;
      const res = yield call(Api.getGoodsList, {
        cityId,
        page,
        size,
        parent_id,
        promot_cate_id,
        goods_name,
        goods_type
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
              goods_type
            }
          }
        }
      });
    },
    *Detail({ payload }, { call, put, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getGoodsDetail, { ...payload, cityId });
      if (res.errno !== 0) return null;
      yield put({
        type: 'save',
        payload: {
          Detail: res.data
        }
      });
      return res.data;
    },
    *selledUsers({ payload }, { call, put, select }) {
      const res = yield call(Api.selledUsers, { ...payload });
      if (res.errno !== 0) return null;
      return res.data;
    },
    *SearchList({ payload }, { call, put, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getGoodsList, { ...payload, cityId });
      if (res.errno !== 0) return null;
      yield put({
        type: 'save',
        payload: {
          SearchList: res.data.data
        }
      });
      return res.data;
    },
    *MsList({ payload }, { call, put, select }) {
      const { cityId } = yield select((state) => state.common);
      const res = yield call(Api.getGoodsList, { ...payload, cityId });
      if (res.errno !== 0) return null;
      yield put({
        type: 'save',
        payload: {
          MsList: res.data.data
        }
      });
      return res.data;
    },
    *Sku({ payload }, { call }) {
      const res = yield call(Api.getSku, { ...payload });
      if (res.errno !== 0) return null;
      return res.data;
    },
    *GetWXACodeUnlimit({ payload }, { call }) {
      const res = yield call(Api.getWXACodeUnlimit, { ...payload });
      return res;
    }
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    clearDetail(state) {
      return { ...state, Detail: {} };
    }
  }
};
