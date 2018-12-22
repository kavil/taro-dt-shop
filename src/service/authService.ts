import Taro from '@tarojs/taro';
import request from '../utils/request';

export class AuthService {


  /**
   * 整合登录
   */
  async login(colonelId) {
    const checkLogin = await this.checkLogin();
    if (checkLogin) return;
    const wxLoginRes = await this.wxLogin();
    const wxUserInfo = await this.wxGetUserInfo();
    const res = await request({
      method: 'post',
      url: '/authColonel/loginByWeixin',
      data: { code: wxLoginRes.code, userInfo: wxUserInfo, colonelId },
    });
    if (res && res.errno === 0) {
      //存储用户信息
      Taro.setStorageSync('userInfo', res.data.userInfo);
      Taro.setStorageSync('token', res.data.token);
      return res.data;
    } else {
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      return;
    }
  }

  /**
   * 微信登录
   */
  wxLogin() {
    return Taro.login();
  }

  /**
   * 检查是否登录
   */
  checkLogin() {
    return Taro.getStorageSync('token');
  }

  /**
   * 获取用户信息
   */
  wxGetUserInfo() {
    return Taro.getUserInfo({
      lang: 'zh_CN',
      withCredentials: true
    })
  }


}
