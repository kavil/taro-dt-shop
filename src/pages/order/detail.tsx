import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
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

type PageOwnProps = {
  Detail: any;
};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ order, common }) => ({
  ...order,
  ...common,
}))
export default class orderDetail extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '订单详情',
    // backgroundColor: '#f8f8f8',
  };

  async componentDidMount() {
    const { Detail } = this.props;
    if (!Detail) Taro.navigateBack();
    this.setState({
      Detail,
    });
  }

  state = {
    Detail: null,
  };

  async onPullDownRefresh() {
    Taro.stopPullDownRefresh();
  }

  pay = async () => {
    const { Detail } = this.props;
    const payParam = await this.props.dispatch({
      type: 'cart/Prepay',
      payload: {
        orderId: Detail.id,
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
      success: res => {
        if (res.errMsg === 'requestPayment:fail cancel') {
          Taro.redirectTo({
            url: `/pages/order/purchased?orderId=${Detail.id}&type=no`,
          });
        } else {
          Taro.redirectTo({
            url: `/pages/order/purchased?orderId=${Detail.id}&type=ok`,
          });
        }
      },
    });
  };

  render() {
    const {} = this.props;
    const {} = this.state;
    return (
      <View className="order-detail-page">
        <View className="top">感谢您在新邻居购物，欢迎再次选购。</View>
        <View className="block-wrap">
          <View className="title">快速达</View>
          <View className="gsw">
            <View key={'ele.id'} className="img-wrap">
              <Image className="img" src={'ele.pic_url' + '@!200X200'} />
            </View>
            <View className="h3">asdf</View>
            <View className="p">数量: 1，</View>
            <View className="down">
              <View className="price">￥23.1</View>
              <View className="op">
                <AtButton circle size="small" type="secondary">
                  加入购物车
                </AtButton>
              </View>
            </View>
          </View>
        </View>
        <View className="block-wrap">
          <View className="d-li">
            <View className="label">订单编号</View>
            <View className="value">132345</View>
          </View>
          <View className="d-li">
            <View className="label">下单时间</View>
            <View className="value">2019-02-04 00:02:11</View>
          </View>
          <View className="d-li">
            <View className="label">支付时间</View>
            <View className="value">2019-02-04 00:02:11</View>
          </View>
        </View>
      </View>
    );
  }
}
