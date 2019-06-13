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

@connect(({ order, common, goods }) => ({
  ...order,
  ...common,
  ...goods,
}))
export default class purchasedShop extends Component<IProps, {}> {
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

    this.setState({ Detail, orderId });
    Taro.showShareMenu();
  }
  componentWillUnmount() {}

  async onPullDownRefresh() {
    Taro.stopPullDownRefresh();
  }

  nextPage(url) {
    Taro.navigateTo({ url });
  }
  nextTab = (url, goto) => {
    if (goto) {
      Taro.setStorageSync(goto, true);
    }
    Taro.switchTab({ url });
  };

  onShareAppMessage() {
    let { Detail }: any = this.state;
    const { userInfo } = this.props;

    return {
      title: `全城免费，吃喝玩乐用通通免费，我是「${userInfo.nickName}」，邀你一起来狂欢`,
      path: `/pages/goods/index?id=${Detail.orderGoods[0].goods_id}&f=${userInfo.id}&c=${
        userInfo.communityId
      }&p=${Detail.shopPlanId}`,
      imageUrl: Detail.share_img,
    };
  }

  state = {
    Detail: null,
    orderId: null,
  };
  render() {
    const {} = this.props;
    const { Detail }: any = this.state;

    return (
      <View className="purchased-page">
        <View className="result">
          <Text className="erduufont ed-dui green" />
          <View className="h4">恭喜，购买成功</View>
          <View className="bew">
            <View className="p">订单金额：{Detail.actual_price}元</View>
          </View>
          <View className="kh">
            您已加入全城狂欢队伍，分享可以赚取佣金，不限人数。
            <Image lazyLoad mode="widthFix" className="img" src={Detail.share_img + '@!q90'} />
          </View>

          <View className="pad40">
            <AtButton type="primary" open-type="share">
              转发赚取佣金￥{Detail.distributeMoney}
            </AtButton>
            <View className="text">点击转发给好友或群，通过你的链接下单成功后，佣金立即到账</View>
          </View>
          <View className="op">
            <AtButton onClick={this.nextTab.bind(this, '/pages/ucenter/index', 'gotoOrder')}>
              查看订单
            </AtButton>
            <AtButton onClick={this.nextTab.bind(this, '/pages/ucenter/index', 'gotoCard')}>
              立即使用
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}
