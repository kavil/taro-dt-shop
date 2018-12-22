import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image } from '@tarojs/components';
import { AtIcon, AtCurtain } from 'taro-ui';
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
}

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any,
}

type PageOwnProps = {
  colonelInfo?: any,
  communityList?: any,
  ewmStatus?: boolean,
  accountInfo?: any,
  manage: number,
}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ common, account }) => ({
  ...common,
  ...account,
}))
class Index extends Component<IProps, {}> {

  /**
 * 指定config的类型声明为: Taro.Config
 *
 * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
 * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
 * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
 */
  config: Config = {
    navigationBarTitleText: '团长中心',
    navigationBarBackgroundColor: '#6190E8',
    navigationBarTextStyle: 'white',
    backgroundTextStyle: 'dark',
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentDidMount() {
    console.log(this.$router.params, 'this.$router.params- -- componentDidMount');

  }

  async componentWillMount() {
    if (this.$router.params.colonelId) {
      Taro.setStorageSync('launchInfo', JSON.stringify({ colonelId: this.$router.params.colonelId }));
      await this.props.dispatch({
        type: 'common/save',
        payload: {
          launchInfo: this.$router.params
        }
      })
      console.log(this.$router.params, 'this.$router.params will');
    }
    if (!this.props.token) {
      Taro.redirectTo({
        url: '/pages/login/index',
      })
      return;
    }
    this.getColonelInfo();
  }

  onPullDownRefresh() {
    this.getColonelInfo();
  }

  async getColonelInfo() {
    await this.props.dispatch({
      type: 'common/loadColonelInfo',
      payload: {
        colonel: true,
      }
    })
    if (!(this.props.colonelInfo && this.props.colonelInfo.id)) {
      Taro.redirectTo({ url: '/pages/apply/index' })
      return;
    }
    this.props.dispatch({
      type: 'account/load'
    })

  }

  ewmStatusFun() {
    this.props.dispatch({ type: 'common/switchEwm' })
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
    const { colonelInfo, communityList, ewmStatus, accountInfo, manage } = this.props;

    return (
      <View className='index'>
        <AtCurtain isOpened={ewmStatus} onClose={this.ewmStatusFun}>
          <Image className="ewm" mode="aspectFill" onClick={this.lookBig.bind(this, colonelInfo.ewm)} src={colonelInfo.ewm} />
        </AtCurtain>
        <View className='top-wrap'>
          <View className='top-head'>
            <View className='left'>
              <Text className="erduufont ed-zhuye1"></Text>
              {communityList ? communityList.map(ele => ele.name).join('，') : '无小区'}
            </View>
            {/* <View className='right'>
              切换<AtIcon value='shuffle-play' size='16' color='#aaa'></AtIcon>
            </View> */}
          </View>
          <View className='top-info'>
            {colonelInfo.avatar ?
              <Image mode="scaleToFill" className="ava" src={colonelInfo.avatar} /> :
              <Text className="erduufont ed-me"></Text>
            }
            {colonelInfo.nickname}
            <View className='p'>{colonelInfo.mobile}</View>
            <Text className="erduufont ed-ewm" onClick={this.ewmStatusFun}></Text>
          </View>
        </View>
        <View className='operate-wrap'>
          <View className='li' onClick={this.nextPage.bind(this, '/pages/pickup/index')}>
            <Text className="erduufont ed-quhuo"></Text>顾客取件
          </View>
          <View className='li' onClick={this.nextPage.bind(this, '/pages/pickup/list')}>
            <Text className="erduufont ed-peihuodan"></Text>取件订单
          </View>
          <View className='li' onClick={this.nextPage.bind(this, '/pages/order/index')}>
            <Text className="erduufont ed-dingdan"></Text>全部订单
          </View>
          {manage === 1 ?
            <View className='li' onClick={this.nextPage.bind(this, '/pages/order/index?type=manage')}>
              <Text className="erduufont ed-dingdan"></Text>小区长订单
          </View> : ''}
          <View className='li disabled' onClick={this.nextPage.bind(this, null)}>
            <Text className="erduufont ed-xiaoquguanli"></Text>小区管理
          </View>
        </View>
        <View className='account-wrap'>
          <View className='title' onClick={this.nextPage.bind(this, '/pages/account/index')}>
            <Text className='h1'>我的资产</Text>
            <Text className='erduufont ed-back go'></Text>
          </View>
          <View className='money-num' onClick={this.nextPage.bind(this, '/pages/account/index')}><Text className='small'>￥</Text>{accountInfo.totalAccount}</View>
          <View className='p tac'>可提现总金额￥{accountInfo ? (accountInfo.totalAccount - accountInfo.sumAccountHold).toFixed(2) : 0}</View>
          <View className='money-ul'>
            <View className='li'>
              <View className='block blue-bg'></View>
              <View className='money'>{accountInfo.sumToday}</View>
              <View className='p'>今日销售额·继续奋斗中</View>
            </View>
            <View className='li'>
              <View className='block green-bg'></View>
              <View className='money'>{accountInfo.sum}</View>
              <View className='p'>近30天销售额·加油哦</View>
            </View>
            <View className='li'>
              <View className='block purple-bg'></View>
              <View className='money'>{accountInfo ? (accountInfo.sumToday * accountInfo.percent / 100).toFixed(2) : 0}</View>
              <View className='p'>预计今日可得佣金·三天内没有发生退换货这些就都是我的了</View>
            </View>
            <View className='li'>
              <View className='block gray-bg'></View>
              <View className='money'>{accountInfo.percent}%</View>
              <View className='p'>我的分成比例·据说分成比例会随着总销售而升高</View>
            </View>
            <View className='li'>
              <View className='block red-bg'></View>
              <View className='money'>{accountInfo.ihave}</View>
              <View className='p'>累计提现·有钱了</View>
            </View>
          </View>
        </View>
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
