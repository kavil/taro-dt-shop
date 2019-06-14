import Request from '../utils/request';

// start
export const spread = data => Request({ url: '/index/spread', method: 'GET', data });
export const loginByWeixin = data => Request({ url: '/auth/loginByWeixin', method: 'POST', data });
export const userInfo = data => Request({ url: '/user/info', method: 'GET', data });
export const bindPhone = data => Request({ url: '/user/bindPhone', method: 'POST', data });
export const hasGoods = data => Request({ url: '/user/hasGoods', method: 'GET', data });
export const uploadSign = data => Request({ url: '/index/uploadSign', method: 'GET', data });
export const cityOpen = data => Request({ url: '/index/cityOpen', method: 'GET', data });

export const getCate = data => Request({ url: '/category', method: 'GET', data });
export const getGoodsList = data => Request({ url: '/goods', method: 'GET', data });
export const getGoodsDetail = data => Request({ url: '/goods/info', method: 'GET', data, noLoading: true });
export const getSku = data => Request({ url: '/goods/sku', method: 'GET', data });
export const getWXACodeUnlimit = data => Request({ url: '/goods/getWXACodeUnlimit', method: 'GET', data, noLoading: true });
export const selledUsers = data => Request({ url: '/goods/selledUsers', method: 'GET', data });

export const addCart = data => Request({ url: '/cart/add', method: 'POST', data, noLoading: true });
export const getCart = data => Request({ url: '/cart', method: 'GET', data, noLoading: true });
export const postCart = data => Request({ url: '/cart/update', method: 'POST', data });
export const delCart = data => Request({ url: '/cart/delete', method: 'POST', data });
export const postCheckCart = data => Request({ url: '/cart/checked', method: 'POST', data });
export const checkout = data => Request({ url: '/cart/checkout', method: 'GET', data });
export const orderSubmit = data => Request({ url: '/order/submit', method: 'POST', data });
export const orderSubmitShop = data => Request({ url: '/order/submitShop', method: 'POST', data });
export const prepay = data => Request({ url: '/pay/prepay', method: 'GET', data });

export const nearbyList = data => Request({ url: '/community/nearbyList', method: 'GET', data });
export const idsList = data => Request({ url: '/community/idsList', method: 'POST', data });
export const communitySearch = data => Request({ url: '/community/search', method: 'GET', data });
export const communityBind = data => Request({ url: '/community/bind', method: 'POST', data });
export const communityBindId = data => Request({ url: '/community/bindId', method: 'POST', data });

export const orderList = data => Request({ url: '/order', method: 'GET', data });
export const orderCancel = data => Request({ url: '/order/cancel', method: 'POST', data });
export const orderDetail = data => Request({ url: '/order/info', method: 'GET', data });
export const orderGoodsDetail = data => Request({ url: '/order/goodsDetail', method: 'GET', data });

export const getCoupon = data => Request({ url: '/coupon/list', method: 'GET', data });
export const scoreList = data => Request({ url: '/score', method: 'GET', data });
export const getCard = data => Request({ url: '/card', method: 'GET', data });
export const cardCheckOut = data => Request({ url: '/card/checkOut', method: 'GET', data });
export const cardCheckIt = data => Request({ url: '/card/checkIt', method: 'POST', data });

export const colonelApply = data => Request({ url: '/colonel/apply', method: 'POST', data });
export const getUser = data => Request({ url: '/colonel/getUser', method: 'GET', data });

// common
export const formId = data => Request({ url: '/user/formId', method: 'POST', data });

// 配送路线
export const deliverCommunity = data => Request({ url: '/order/community', method: 'GET', data });
export const deliverSetline = data => Request({ url: '/deliver/setline', method: 'GET', data });

// shop
export const getShopList = data => Request({ url: '/cshop', method: 'GET', data });
export const getShopDetail = data => Request({ url: '/cshop/info', method: 'GET', data, noLoading: true });
export const getProductList = data => Request({ url: '/cshop/product', method: 'GET', data });
export const getShopProductDetail = data => Request({ url: '/cshop/productInfo', method: 'GET', data, noLoading: true });
export const shopUser = data => Request({ url: '/cshop/shopUser', method: 'GET', data });
export const applyAction = data => Request({ url: '/cshop/applyAction', method: 'POST', data });

// 余额
export const accountInfo = data => Request({ url: '/user/accountInfo', method: 'GET', data });
export const accountList = data => Request({ url: '/user/accountList', method: 'GET', data });
export const accountDetail = data => Request({ url: '/user/accountDetail', method: 'GET', data });
export const withdraw = data => Request({ url: '/user/withdraw', method: 'POST', data });

// pickup
export const getcodeInfo = data => Request({ url: '/cshop/getcodeInfo', method: 'GET', data });
export const getcodeUse = data => Request({ url: '/cshop/getcodeUse', method: 'POST', data });
export const checkRecordList = data => Request({ url: '/card/checkRecordList', method: 'POST', data });

// 模板自动生成占位 勿删

