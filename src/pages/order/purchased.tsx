import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './purchased.scss';
import { AtButton } from 'taro-ui';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {
  userInfo: any;
  colonelInfo: any;
};

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
  };

  async componentDidMount() {
    const orderId = this.$router.params.orderId;
    const Detail = await this.props.dispatch({
      type: 'order/Detail',
      payload: {
        id: orderId,
      },
    });
    const selled = await this.props.dispatch({
      type: 'goods/selledUsers',
      payload: {
        goods_id: Detail.orderGoods ? Detail.orderGoods[0].goods_id : 0,
      },
    });
    this.setState({ Detail, selled, orderId });
    Taro.showShareMenu();
  }
  componentWillUnmount() {}

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
        orderId: this.$router.params.orderId,
      },
    });
    if (!payParam) {
      return;
    }
    await Taro.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
      success: res => {
        if (res.errMsg === 'requestPayment:fail cancel') {
          Taro.redirectTo({
            url: `/pages/order/purchased?orderId=${this.$router.params.id}&type=no`,
          });
        } else {
          Taro.redirectTo({
            url: `/pages/order/purchased?orderId=${this.$router.params.id}&type=ok`,
          });
        }
      },
    });
  };
  lookMore = async () => {
    let { Detail, page, selled }: any = this.state;
    const _page = page + 1;
    const _selled = await this.props.dispatch({
      type: 'goods/selledUsers',
      payload: {
        goods_id: Detail.orderGoods ? Detail.orderGoods[0].goods_id : 0,
        page: _page,
      },
    });
    // selled.data.concat(_selled)
    const data = selled.data.concat(_selled.data);

    this.setState({ selled: { ...selled, data } });
    if (_selled.data.length) {
      this.setState({ page: _page });
    } else {
      this.setState({ nomore: true });
    }
  };

  onShareAppMessage() {
    let { Detail }: any = this.state;

    return {
      title: `@${this.props.userInfo.colonelInfo.nickName}，我是「${
        this.props.userInfo.nickName
      }」，刚刚下单请小区长确认下订单哦`,
      path: `/pages/goods/index?id=${Detail.orderGoods[0].goods_id}&communityId=${
        this.props.userInfo.communityId
      }`,
    };
  }

  state = {
    Detail: null,
    selled: {},
    orderId: null,
    page: 1,
    nomore: false,
  };
  render() {
    const {} = this.props;
    const { Detail, selled, nomore }: any = this.state;
    const result = this.$router.params.type;
    let selledMore: any = [];
    if (selled.data) {
      selledMore = selled.data;
    }

    return (
      <View className="purchased-page">
        {result === 'ok' ? (
          <View className="result">
            <Text className="erduufont ed-dui green" />
            <View className="h4">支付成功，请小区长及时处理订单</View>
            <View className="bew">
              <View className="p">订单金额：{Detail.actual_price}元</View>
              {Detail.score && Detail.score.score ? (
                <View className="p">积分：{Detail.score ? Detail.score.score || 0 : '无'}</View>
              ) : null}
            </View>
            <View className="long">
              <View className="info">刚刚购买用户</View>
              {selledMore.map((ele, i) => (
                <View key={ele.id} className="long-li">
                  {selled.count - i}、
                  <View className="img-wrap">
                    <Image className="img" src={ele.userInfo.avatarUrl} />
                    <View className="name">{ele.userInfo.nickName}</View>
                  </View>
                  <View className="info">
                    <Text className="goods">
                      {ele.goods_name.length > 6
                        ? ele.goods_name.substr(0, 6) + '...'
                        : ele.goods_name}
                    </Text>
                    <Text className="b"> + {ele.number}</Text>
                  </View>
                </View>
              ))}
              {selled.count > 5 && (
                <View className="more" onClick={this.lookMore}>
                  {nomore ? '没有更多了' : '点击查看更多 v'}
                </View>
              )}
            </View>

            <View className="pad40">
              <AtButton type="primary" open-type="share">
                点击提醒接单
              </AtButton>

              <View className="text">点击转发到「寻味知途·团购小区群」通知小区长及时查看处理订单</View>
            </View>
            <View className="op">
              {/* <AtButton onClick={this.nextTab.bind(this, '/pages/ucenter/index', 'gotoOrder')}>
                查看订单
              </AtButton> */}
              <AtButton onClick={this.nextTab.bind(this, '/pages/index/index')}>继续购物</AtButton>
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
