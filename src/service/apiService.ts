import Request from '../utils/request';

// account start
export const accountInfo = data => Request({ url: '/colonel/accountInfo', method: 'GET', data });
export const accountList = data => Request({ url: '/colonel/accountList', method: 'GET', data });
export const accountDetail = data => Request({ url: '/colonel/accountDetail', method: 'GET', data });
export const withdraw = data => Request({ url: '/colonel/withdraw', method: 'POST', data });
export const colonelInfo = data => Request({ url: '/user/info', method: 'GET', data });
// account end
export const getColonelName = data => Request({ url: '/colonel/name', method: 'GET', data });
export const bindPhone = data => Request({ url: '/colonel/bindPhone', method: 'POST', data });

export const orderList = data => Request({ url: '/colonel/orderList', method: 'GET', data });
export const orderStatusChange = data => Request({ url: '/colonel/orderStatusChange', method: 'POST', data });

export const getcodeInfo = data => Request({ url: '/colonel/getcodeInfo', method: 'GET', data });
export const getcodeUse = data => Request({ url: '/colonel/getcodeUse', method: 'POST', data });

export const apply = data => Request({ url: '/url', method: 'GET', data });

// 模板自动生成占位 勿删

