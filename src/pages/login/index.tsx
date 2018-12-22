import Taro, { Component, Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import wxImg from '../../static/images/wx.png';
import handImg from '../../static/images/hand.jpg';
import weImg from '../../static/images/we.png';
import { AtButton } from 'taro-ui';
import { AuthService } from '../../service/authService';
import './index.scss';

interface DispatchOption {
  type?: string,
  payload?: Object,
}
type PageStateProps = {
  launchInfo: any,
  colonelName: any,
  userInfo: any,
  nextBind: boolean,
}
type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any,
}
type PageOwnProps = {

}
// type PageState = {}
type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ common }) => ({
  ...common,
}))
export default class Login extends Component<IProps, {}>{
  authService = new AuthService;

  state = {
    colonelId: this.$router.params.colonelId,
    loading: false,
  }

  config: Config = {
    navigationBarTitleText: '微信授权',
  }

  async componentDidMount() {
    console.log(this.props.launchInfo, 'this.props.launchInfo');
    if (this.props.launchInfo && this.props.launchInfo.colonelId) {
      await this.props.dispatch({
        type: 'common/getColonelName'
      })
    }
  };

  async loginFun(event) {
    if (event.detail.errMsg !== 'getUserInfo:ok') {
      this.setState({
        show: false,
        loading: false
      });
      return;
    }
    this.setState({
      loading: true
    })
    const res = await this.authService.login(this.props.launchInfo.colonelId);
    if (res && res.token) {
      await this.props.dispatch({
        type: 'common/save',
        payload: {
          token: res.token,
          userInfo: res.userInfo,
        }
      })
      if (this.props.userInfo && this.props.userInfo.shopUserId) {
        Taro.redirectTo({
          url: '/pages/index/index'
        })
      } else {
        // 如果是直接从此小程序进来 此时要求绑定手机号
        this.props.dispatch({
          type: 'common/save',
          payload: {
            nextBind: true,
          }
        })
      }
    }
    this.setState({
      show: false,
      loading: false
    })
  }

  async bindPhone(event) {
    console.log(event);
    
    if (event.detail.errMsg !== 'getPhoneNumber:ok') {
      this.setState({
        show: false,
        loading: false
      });
      return;
    }
    this.setState({
      loading: true
    })
    await Taro.login({
      success: async (res) => {
        const back = await this.props.dispatch({
          type: 'common/bindPhone',
          payload: {
            code: res.code,
            encryptedData: event.detail.encryptedData,
            iv: event.detail.iv,
          }
        })
        if (back) {
          Taro.redirectTo({
            url: '/pages/index/index'
          })
        } else {
          Taro.redirectTo({
            url: '/pages/apply/index'
          })
        }
      }
    });

    this.setState({
      show: false,
      loading: false
    })
  }

  render() {
    const { colonelName, nextBind } = this.props;
    return (
      <View className="login-page">
        <View className="pad40 h1">
          {nextBind ? '' : '您好'}{colonelName ?
            <View><View className="h2">团长，{colonelName}</View><View className="p">请点击授权关联账号，开启全新社区新零售。</View></View>
            : <View>
              {nextBind ? <View><View className="h2">第二步</View><View className="p">请点击授权手机号，自动识别是否团购商城团长。</View></View> :
                <View className="p">请点击授权登录，开启全新社区新零售。</View>}
            </View>
          }
        </View>
        <View className="logo-wrap">
          <View className="logo">
            {colonelName ? <Image className="image" src={weImg} /> : <Image className="image" src={wxImg} />}
          </View>
          <View>
            <Text className='erduufont ed-back go'></Text>
            <Text className='erduufont ed-back go'></Text>
            <Text className='erduufont ed-back go'></Text>
          </View>
          <View className="logo">
            <Image className="image" src={handImg} />
          </View>
        </View>
        {!nextBind ?
          <View className="pad40">
            {this.state.colonelId ?
              <AtButton type='primary' loading={this.state.loading} openType="getUserInfo"
                onGetUserInfo={this.loginFun} disabled={this.state.loading}>关联账号</AtButton> :
              <AtButton type='primary' loading={this.state.loading} openType="getUserInfo"
                onGetUserInfo={this.loginFun} disabled={this.state.loading}>授权登录</AtButton>}
          </View>
          :
          <View className="pad40">
            <AtButton type='primary' loading={this.state.loading} openType="getPhoneNumber"
              onGetPhoneNumber={this.bindPhone} disabled={this.state.loading}>绑定手机号</AtButton>
          </View>}
      </View>
    )
  }
}
