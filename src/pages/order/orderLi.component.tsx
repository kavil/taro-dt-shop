import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { AtAvatar } from 'taro-ui';
import { connect } from '@tarojs/redux';
import './index.scss';

interface DispatchOption {
  type?: string,
  payload?: Object,
}

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any,
}

type PageOwnProps = {
  order: any,
}

// type PageState = {}

type IProps = PageOwnProps & DispatchOption & PageDispatchProps;

@connect(({ order, common }) => ({
  ...order,
  ...common,
}))
export class OrderLi extends Component<IProps, {}> {

  props: any = {
    order: {}
  }

  async action(item) {
    if (!this.props.manage || this.props.manage < 1) return;
    if (item.order_status !== 201) {
      Taro.showToast({
        title: '仅支持修改【已付款】订单',
        icon: 'none',
      })
      return;
    }
    const res = await Taro.showModal({
      title: '提示',
      content: '确定更改状态为【已收货完成】？',
    })
    console.log(res);
    if (res.confirm) {
      await this.props.dispatch({
        type: 'order/statusChange',
        payload: {
          orderId: item.id,
        }
      })
      await this.props.dispatch({
        type: 'order/orderList'
      })
    }

  }

  render() {
    const { order } = this.props;
    const orderRange = { 0: '未付款', 201: '已付款', 300: '已发货', 301: '已完成', };

    return (
      <View className="order-li">
        <View className="top">
          <View className="user">
            <AtAvatar size="small" circle image={order.userInfo.avatar}></AtAvatar>
            <View>
              <View className="nick">{order.userInfo.nickname}</View>
              <View className="nick">{order.userInfo.mobile}</View>
            </View>
          </View>
          <View className="sn"><View className="block">订单号</View>{order.order_sn}</View>
        </View>
        {order.orderGoods.map(item => {
          return <View className="center" key={item.id}>
            <View className="main">
              <View className="ava">
                <AtAvatar size="large" image={item.list_pic_url}></AtAvatar>
              </View>
              <View className="name">{item.goods_name}<View className="p">数量：{item.number} 规格： {item.goods_specifition_name_value}</View></View>
            </View>
            <View className="price">{item.retail_price}元</View>
          </View>
        })}
        {order.coupon_price ? <View className="coupon">优惠券抵扣：￥{order.coupon_price}</View> : ''}
        <View className="bottom">
          <View className="left">
            <Text onClick={this.action.bind(this, order)} className={`st st-${order.order_status}`}>{orderRange[order.order_status]}</Text>
            {order.order_status ? '实付：￥' + order.actual_price : ''}
          </View>
          {order && order.add_time ?
            <View className="right">{new Date((order.add_time || 0) * 1000).toLocaleString('zh', { hour12: false })}</View>
            : ''}
        </View>
      </View>
    )
  }
}
