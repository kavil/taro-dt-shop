import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtList, AtListItem, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import './index.scss';

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
  accountInfo?: any,
}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps


@connect(({ account }) => ({
  ...account,
}))
export default class Account extends Component<IProps, {}>{
  config = {
    navigationBarTitleText: '账户',
  };

  componentDidMount = () => {

  };
  onPullDownRefresh(){
    Taro.stopPullDownRefresh();
  }
  nextPage(url) {
    Taro.navigateTo({ url });
  }
  gameOver() {
    this.setState({
      open: true,
    })
  }
  cancel() {
    this.setState({
      open: false,
    })
  }
  makeCall() {
    Taro.makePhoneCall({
      phoneNumber: '13755556614'
    })
  }

  state = {
    open: false
  }

  render() {
    const { accountInfo } = this.props;
    return (
      <View className="account-page">
        <View className="account-top">
          <Text className="tip">余额账户(元)</Text>
          <View className="yue">{accountInfo.totalAccount}</View>
        </View>
        <View className="account-top small">
          <Text className="tip">可提现账户(元)</Text>
          <View className="yue">{accountInfo ? (accountInfo.totalAccount - accountInfo.sumAccountHold).toFixed(2) : 0}</View>
        </View>
        <View className="account-info">近3天订单收益暂时冻结，不允许提现。</View>

        <AtList>
          <AtListItem onClick={this.gameOver}
            title='提现' arrow='right' extraText="免服务费"
            iconInfo={{ size: 25, value: ' erduufont ed-tixian blue', }} />
          <AtListItem onClick={this.nextPage.bind(this, '/pages/account/list')}
            title='明细' arrow='right'
            iconInfo={{ size: 25, value: ' erduufont ed-mingxi yellow', }} />
        </AtList>

        <AtModal isOpened={this.state.open}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>
            Sorry！暂不支持自动提现，请联系工作人员。13755556614
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.cancel.bind(this)}>取消</Button>
            <Button onClick={this.makeCall.bind(this)}>拨打电话</Button>
          </AtModalAction>
        </AtModal>
      </View >
    )
  }
}

