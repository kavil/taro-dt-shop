import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image } from '@tarojs/components';
import { AtCurtain } from 'taro-ui';
import './index.scss';
import sadImg from '../../static/images/sad.png';

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion
interface DispatchOption {
  type?: string,
  payload?: Object,
}

type PageStateProps = {
  token?: string,
  manage: number,
}

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any,
}

type PageOwnProps = {
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ common }) => ({
  ...common,
}))
class Index extends Component<IProps, {}> {

  /**
 * 指定config的类型声明为: Taro.Config
 *
 * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
 * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
 * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
 */
  // config: Config = {
  //   navigationBarTitleText: '新邻居',
  //   // navigationBarBackgroundColor: '#fff',
  //   navigationBarTextStyle: 'white',
  //   backgroundTextStyle: 'dark',
  // }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentDidMount() {
    console.log(this.$router.params, 'this.$router.params- -- componentDidMount');
  }

  async componentWillMount() {

  }

  onPullDownRefresh() {

  }

  nextPage(url) {
    if (!url) {
      Taro.showToast({
        title: '暂未开放',
        image: sadImg,
      })
      return;
    }
    Taro.navigateTo({
      url: url
    })
  }

  lookBig(img) {
    Taro.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  }

  render() {
    const { } = this.props;

    return (
      <View className='index'>
index
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
