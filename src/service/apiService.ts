import Request from '../utils/request';

// start
export const loginByWeixin = data => Request({ url: '/auth/loginByWeixin', method: 'POST', data });
export const userInfo = data => Request({ url: '/user/info', method: 'GET', data });
export const bindPhone = data => Request({ url: '/user/bindPhone', method: 'POST', data });

export const getCate = data => Request({ url: '/category', method: 'GET', data });
export const getGoodsList = data => Request({ url: '/goods', method: 'GET', data });
export const getGoodsDetail = data => Request({ url: '/goods/info', method: 'GET', data, noLoading: true });
export const getSku = data => Request({ url: '/goods/sku', method: 'GET', data, noLoading: true });

export const addCart = data => Request({ url: '/cart/add', method: 'POST', data });
export const getCart = data => Request({ url: '/cart', method: 'GET', data });
export const postCart = data => Request({ url: '/cart/update', method: 'POST', data });
export const delCart = data => Request({ url: '/cart/delete', method: 'POST', data });
export const postCheckCart = data => Request({ url: '/cart/checked', method: 'POST', data });
export const checkout = data => Request({ url: '/cart/checkout', method: 'GET', data });
export const orderSubmit = data => Request({ url: '/order/submit', method: 'POST', data });
export const prepay = data => Request({ url: '/pay/prepay', method: 'GET', data });

export const nearbyList = data => Request({ url: '/community/nearbyList', method: 'GET', data });
export const communitySearch = data => Request({ url: '/community/search', method: 'GET', data });
export const communityBind = data => Request({ url: '/community/bind', method: 'POST', data });

export const orderList = data => Request({ url: '/order', method: 'GET', data });
export const orderCancel = data => Request({ url: '/order/cancel', method: 'POST', data });

export const getCoupon = data => Request({ url: '/coupon/list', method: 'GET', data });
export const scoreList = data => Request({ url: '/score', method: 'GET', data });

// 模板自动生成占位 勿删

