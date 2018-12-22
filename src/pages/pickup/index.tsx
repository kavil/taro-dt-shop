import Taro, { Component } from '@tarojs/taro';
import { View, Input, Button } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';
import './index.scss';
import { OrderLi } from '../order/orderLi.component';

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
  getcodeInfo: any;
}
// type PageState = {}
type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ pickup }) => ({
  ...pickup,
}))
export default class Pickup extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '顾客取货',
  };

  componentDidMount() {

  };

  onInput(e) {
    let code = e.detail.value;
    this.setState({ code });
    return code;
  }

  async onConfirm() {
    const res = await this.props.dispatch({
      type: 'pickup/getcodeInfo',
      payload: {
        getcode: this.state.code
      }
    })
    if (res) {
      this.setState({
        open: true
      })
    }
  }

  cancel() {
    this.setState({
      open: false
    })
  }

  async sure() {
    this.setState({
      loading: true,
      open: false,
    })

    const res = await this.props.dispatch({
      type: 'pickup/getcodeUse',
      payload: {
        getcode: this.state.code
      }
    })
    this.setState({
      loading: false,
    })
    if (res) {
      await Taro.showModal({
        title: '提示',
        content: '取件成功',
        showCancel: false,
      })
      await this.props.dispatch({
        type: 'account/load',
        payload: {
          getcode: this.state.code
        }
      })
      Taro.navigateBack();
    }
  }

  state = {
    code: undefined,
    loading: false,
    open: false,
  }

  props: any = {
    getcodeInfo: {}
  }

  render() {
    const { getcodeInfo } = this.props;
    return (
      <View className="pickup-page">
        <View className="pad40 h1">
          取件码<View className="p">询问顾客4位取件码，在团购小程序的订单中可以找到</View>
        </View>
        <View className="code-wrap pad40 tac">
          <Input className='input' maxLength={4} type="digit" onInput={this.onInput} value={this.state.code} focus confirmHold />
          <View className="p">请输入4位取件码</View>
        </View>
        <View className="pad40"><AtButton onClick={this.onConfirm.bind(this, this.state.code)} loading={this.state.loading} disabled={this.state.loading} type='primary'>确定</AtButton></View>

        <AtModal isOpened={this.state.open}>
          <AtModalHeader>{getcodeInfo.codeInfo.getcodeStatus ? '确认订单' : '该订单已被取件'}</AtModalHeader>
          <AtModalContent>
            <OrderLi order={getcodeInfo} />
          </AtModalContent>
          {getcodeInfo.codeInfo.getcodeStatus ?
            <AtModalAction>
              <Button onClick={this.cancel.bind(this)}>取消</Button>
              <Button onClick={this.sure.bind(this)}>确定</Button>
            </AtModalAction>
            :
            <AtModalAction>
              <Button onClick={this.cancel.bind(this)}>关闭</Button>
            </AtModalAction>}
        </AtModal>
      </View>
    )
  }
}
