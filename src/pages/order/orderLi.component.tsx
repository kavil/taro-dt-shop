import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { AtAvatar, AtButton, AtCountdown } from 'taro-ui';
import { connect } from '@tarojs/redux';
import './index.scss';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {
  order: any;
};

// type PageState = {}

type IProps = PageOwnProps & DispatchOption & PageDispatchProps;

@connect(({ order, cart, common }) => ({
  ...order,
  ...cart,
  ...common,
}))
export class OrderLi extends Component<IProps, {}> {
  props: any = {
    order: {},
  };

  cancel = async () => {
    const res = await Taro.showModal({
      title: '提示',
      content: '确定取消订单？',
    });
    if (res.confirm) {
      await this.props.dispatch({
        type: 'order/Cancel',
        payload: {
          orderId: this.props.order.id,
        },
      });
      await this.props.dispatch({
        type: 'order/orderList',
      });
    }
  };

  pay = async () => {
    const payParam = await this.props.dispatch({
      type: 'cart/Prepay',
      payload: {
        orderId: this.props.order.id,
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
            url: `/pages/order/purchased?orderId=${this.props.order.id}&type=no`,
          });
        } else {
          Taro.redirectTo({
            url: `/pages/order/purchased?orderId=${this.props.order.id}&type=ok`,
          });
        }
      },
    });
  };
  refund = () => {};
  onTimeUp = () => {};
  countdown = add_time => {
    const cha = (new Date(add_time).getTime() + 3600000 - new Date().getTime()) / 1000;
    const day = Math.floor(cha / 86400);
    const time: any = [];
    const lasthour = cha - 86400 * day;
    time.push(Math.floor(lasthour / 3600));
    const lastMin = lasthour - 3600 * time[0];
    time.push(Math.floor(lastMin / 60));
    const lastSec = lastMin - 60 * time[1];
    time.push(lastSec);

    return time;
  };
  render() {
    const { order } = this.props;
    const orderRange = {
      0: '未付款',
      201: '已付款',
      300: '已发货',
      301: '已完成',
      400: '已退款',
      401: '已退货',
    };
    const op = order.handleOption;
    const countdown = this.countdown(order.add_time);

    return (
      <View className="order-li">
        <View className="top">
          <View className="user">
            <View>
              <View className="nick">订单号</View>
              <View className="nick">{order.order_sn}</View>
            </View>
          </View>
          {order.getcode && (
            <View className="sn">
              <View className="block">取件码</View>
              {order.getcode.getcode}
            </View>
          )}
          {/* 不知道为啥这里 countdown 有问题 不显示 // 估计是setstate */}
          {op && op.pay && countdown && (
            <View className="last-time">
              付款剩余{countdown[2]}
              <AtCountdown
                format={{ hours: ':', minutes: ':', seconds: '' }}
                hours={countdown[0]}
                minutes={countdown[1]}
                onTimeUp={this.onTimeUp}
              />
            </View>
          )}
        </View>
        {order.orderGoods &&
          order.orderGoods.map(item => {
            return (
              <View className="center" key={item.id}>
                <View className="main">
                  <View className="ava">
                    <AtAvatar size="large" image={item.pic_url + '@!300X300'} />
                  </View>
                  <View className="name">
                    {item.goods_name}
                    <View className="p">
                      数量：{item.number}
                      {item.specifition_names ? '，' + item.specifition_names : null}
                    </View>
                  </View>
                </View>
                <View className="price">{item.actual_price}元</View>
              </View>
            );
          })}
        {order.coupon_price && <View className="coupon">优惠券抵扣：￥{order.coupon_price}</View>}
        {order.score_price && <View className="coupon">积分抵扣：￥{order.score_price}</View>}
        <View className="bottom">
          <View className="left">
            <Text className={`st st-${order.order_status}`}>{order.order_status_text}</Text>
            {order.order_status ? '实付:￥' + order.actual_price : ''}
          </View>
          <View className="right">
            {op.delete && <Text className="secondary">删除订单</Text>}
            {op.cancel && (
              <AtButton size="small" circle onClick={this.cancel}>
                取消订单
              </AtButton>
            )}
            {op.comment && (
              <AtButton size="small" circle>
                评价晒单
              </AtButton>
            )}
            {op.pay && (
              <AtButton size="small" circle type="secondary" onClick={this.pay}>
                去付款
              </AtButton>
            )}
            {/* {op.return && order.order_status === 300 && (
              <AtButton size="small" circle onClick={this.refund}>
                退款
              </AtButton>
            )} */}
            {/* {op.buy && (
              <AtButton size="small" circle type="secondary">
                再次购买
              </AtButton>
            )} */}
          </View>
        </View>
      </View>
    );
  }
}
