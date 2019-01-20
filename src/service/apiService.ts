import Request from '../utils/request';

// start
export const loginByWeixin = data => Request({ url: '/auth/loginByWeixin', method: 'POST', data });

export const getCateTop = data => Request({ url: '/category/topCategory', method: 'GET', data });
export const getGoodsList = data => Request({ url: '/goods', method: 'GET', data });
export const getGoodsDetail = data => Request({ url: '/goods/info', method: 'GET', data, noLoading: true });
export const getSku = data => Request({ url: '/goods/sku', method: 'GET', data, noLoading: true });

export const goods = data => Request({ url: '/url', method: 'GET', data });

// 模板自动生成占位 勿删

