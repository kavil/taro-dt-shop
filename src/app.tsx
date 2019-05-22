import '@tarojs/async-await';
import Taro, { Component, Config } from '@tarojs/taro';
import Index from './pages/index';
import dva from './utils/dva';
import models from './models';
import { Provider } from '@tarojs/redux';

import './app.scss';

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const dvaApp = dva.createApp({
  initialState: {},
  models: models,
});
const store = dvaApp.getStore();

class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/index/index',
      'pages/deliver/index',
      'pages/login/index',
      'pages/colonelApply/index',
      'pages/index/search',
      'pages/ucenter/index',
      'pages/ucenter/coupon',
      'pages/ucenter/score',
      'pages/order/index',
      'pages/order/purchased',
      'pages/neighbor/index',
      'pages/neighbor/search',
      'pages/neighbor/active',
      'pages/goods/index',
      'pages/cart/index',
      'pages/cart/checkout',
    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '寻味知途',
      navigationBarTextStyle: 'black',
      enablePullDownRefresh: true,
      onReachBottomDistance: 100,
      backgroundColor: '#f1f1f1',
    },
    tabBar: {
      backgroundColor: '#fafafa',
      borderStyle: 'white',
      selectedColor: '#1a1a1a',
      color: '#666',
      list: [
        {
          pagePath: 'pages/index/index',
          iconPath: 'static/images/home.png',
          selectedIconPath: 'static/images/home-a.png',
          text: '首页',
        },
        // {
        //   pagePath: 'pages/neighbor/index',
        //   iconPath: 'static/images/circle.png',
        //   selectedIconPath: 'static/images/circle-a.png',
        //   text: '邻居圈',
        // },
        {
          pagePath: 'pages/cart/index',
          iconPath: 'static/images/cart.png',
          selectedIconPath: 'static/images/cart-a.png',
          text: '购物车',
        },
        {
          pagePath: 'pages/ucenter/index',
          iconPath: 'static/images/me.png',
          selectedIconPath: 'static/images/me-a.png',
          text: '我的',
        },
      ],
    },
    permission: {
      'scope.userLocation': {
        desc: '你的位置信息将用于查询附近小区',
      },
    },
    navigateToMiniProgramAppIdList: ['wx022960c7a872290f'],
  };

  async componentDidMount() {
    const up = Taro.getUpdateManager();

    up.onUpdateReady(() => {
      Taro.showModal({
        title: '更新提示',
        content: '检测到有新版本',
        showCancel: false,
        confirmText: '立即更新',
        success: res => {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            up.applyUpdate();
          }
        },
      });
    });

    const { communityId } = this.$router.params.query;
    if (communityId) Taro.setStorageSync('communityId', communityId);

    if (Taro.getStorageSync('token')) {
      const userInfo = await store.dispatch({
        type: 'common/UserInfo',
      });

      if (communityId) {
        if (userInfo.communityId) {
          // 之前如果有绑定，提出提示更换
          // if (userInfo.communityId != communityId) Taro.setStorageSync('changeCids', [userInfo.communityId, communityId].join(','));
        } else {
          // 没有绑定过小区的  自动绑定
          await this.bindCommunity(communityId);
        }
      } else {
        // 如果是没带community的链接进来
        if (!(userInfo && userInfo.communityId)) {
          Taro.redirectTo({ url: '/pages/neighbor/search?mode=redirect' });
          return;
        }
      }
      store.dispatch({
        type: 'cart/Index',
      });
    }
  }

  async bindCommunity(communityId) {
    await store.dispatch({
      type: 'neighbor/BindId',
      payload: {
        id: communityId,
      },
    });
    await store.dispatch({
      type: 'common/UserInfo',
    });
  }

  componentDidShow() {}

  componentDidHide() {
    store.dispatch({
      type: 'common/formId',
    });
  }

  componentCatchError() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
