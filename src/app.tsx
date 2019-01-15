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
    pages: ['pages/index/index'],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '新邻居',
      navigationBarTextStyle: 'black',
      enablePullDownRefresh: true,
      onReachBottomDistance: 10,
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
        {
          pagePath: 'pages/index/index',
          iconPath: 'static/images/circle.png',
          selectedIconPath: 'static/images/circle-a.png',
          text: '邻居圈',
        },
        {
          pagePath: 'pages/index/index',
          iconPath: 'static/images/cart.png',
          selectedIconPath: 'static/images/cart-a.png',
          text: '购物车',
        },
        {
          pagePath: 'pages/index/index',
          iconPath: 'static/images/me.png',
          selectedIconPath: 'static/images/me-a.png',
          text: '我的',
        },
      ],
    },
  };

  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

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
