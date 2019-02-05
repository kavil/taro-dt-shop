import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './purchased.scss';
import { AtButton } from 'taro-ui';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {};

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ order, common }) => ({
  ...order,
  ...common,
}))
export default class purchased extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '支付结果',
    // backgroundColor: '#f8f8f8',
  };

  async componentDidMount() {}
  componentWillUnmount() {}
  state = {};

  async onPullDownRefresh() {
    Taro.stopPullDownRefresh();
  }

  nextPage(url) {
    Taro.navigateTo({ url });
  }
  nextTab = (url, gotoOrder) => {
    if (gotoOrder) {
      Taro.setStorageSync('gotoOrder', true);
    }
    Taro.switchTab({ url });
  };
  pay = async () => {
    const payParam = await this.props.dispatch({
      type: 'cart/Prepay',
      payload: {
        orderId: this.$router.params.id,
      },
    });
    if (!payParam) {
      return;
    }
    const res = await Taro.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
    });
    if (res) {
      Taro.redirectTo({
        url: `/pages/order/purchased?orderId=${this.$router.params.id}&type=ok`,
      });
    } else {
      Taro.redirectTo({
        url: `/pages/order/purchased?orderId=${this.$router.params.id}&type=no`,
      });
    }
  };

  render() {
    const {} = this.props;
    const {} = this.state;
    const result = this.$router.params.type;
    return (
      <View className="purchased-page">
        {result ? (
          <View className="result">
            <Text className="erduufont ed-dui green" />
            <View className="h4">支付成功</View>
            <View className="p">订单金额：34.1元</View>
            <View className="p">获得积分：34</View>
            <View className="op">
              <AtButton
                type="secondary"
                onClick={this.nextTab.bind(this, '/pages/ucenter/index', 'gotoOrder')}
              >
                查看订单
              </AtButton>
              <AtButton type="secondary" onClick={this.nextTab.bind(this, '/pages/index/index')}>
                返回首页
              </AtButton>
            </View>
          </View>
        ) : (
          <View className="result">
            <Text className="erduufont ed-cuo" />
            <View className="h4">支付失败</View>
            <View className="op">
              <AtButton type="secondary" onClick={this.nextPage.bind(this, '/pages/order/index')}>
                查看订单
              </AtButton>
              <AtButton type="secondary" onClick={this.pay}>
                继续支付
              </AtButton>
            </View>
          </View>
        )}
      </View>
    );
  }
}
