import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton } from 'taro-ui';

interface DispatchOption {
  type?: string,
  payload?: Object,
}
type PageStateProps = {
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
export default class Apply extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '团长申请',
  };

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
        }
      }
    });
    this.setState({
      show: false,
      loading: false
    })
  }
  state = {
    loading: false,
  }


  render() {
    const { } = this.props;
    return (
      <View className="apply-page">
        <View className="pad40 h1">
          您好
          <View className="h2">您还不是团长</View>
          <View className="p">请联系管理员申请开通13755556614。</View>
        </View>
        <View className="pad40">
          <AtButton type='primary' loading={this.state.loading} openType="getPhoneNumber"
            onGetPhoneNumber={this.bindPhone} disabled={this.state.loading}>同步手机号</AtButton>
          <View className="p">已经是团长？同步手机号试试</View>
        </View>
      </View>
    )
  }
}
