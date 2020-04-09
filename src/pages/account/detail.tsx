import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtAvatar } from 'taro-ui';
import './index.scss';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {};

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {
  accountDetail?: any;
};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ account }) => ({
  ...account
}))
export default class Detail extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '余额明细详情'
  };

  componentDidMount = () => {
    this.getAccountDetail();
  };

  async getAccountDetail() {
    await this.props.dispatch({
      type: 'account/accountDetail',
      payload: {
        id: this.$router.params.id
      }
    });
  }

  onPullDownRefresh() {
    this.getAccountDetail();
  }

  typeRange = ['全部类型', '收入', '提现', '其他'];
  orderRange = { 0: '未付款', 101: '已取消', 201: '已付款', 300: '已发货', 301: '已完成' };

  render() {
    const D = this.props.accountDetail;
    return (
      <View className="account-page detail">
        <View className="simple-ul">
          <View className="li">
            <View className="left">类型：</View>
            <View className="right">{this.typeRange[D.opType]}</View>
          </View>
          {D.order_sn != 0 ? (
            <View>
              <View className="li">
                <View className="left">订单号：</View>
                <View className="right">{D.order_sn}</View>
              </View>
              <View className="li">
                <View className="left">订单状态：</View>
                <View className="right">{this.orderRange[D.order_status]}</View>
              </View>
            </View>
          ) : (
            ''
          )}
          <View className="li">
            <View className="left">金额：</View>
            <View className="right">{D.money}元</View>
          </View>
          <View className="li">
            <View className="left">余额：</View>
            <View className="right">{D.totalMoney}元</View>
          </View>
          <View className="li">
            <View className="left">备注：</View>
            <View className="right">{D.note}</View>
          </View>
          <View className="li">
            <View className="left">入账时间：</View>
            <View className="right">{D.createdTime}</View>
          </View>
          {D.userInfo ? (
            <View className="user-area">
              <View className="li">
                <View className="left">购买人：</View>
                <View className="right">
                  <AtAvatar circle image={D.userInfo.avatarUrl} />
                  {D.userInfo.nickName}
                </View>
              </View>
              <View className="li">
                <View className="left">手机号：</View>
                <View className="right">{D.userInfo.mobile}</View>
              </View>
              <View className="li">
                <View className="left">性别：</View>
                <View className="right">{D.userInfo.gender === 1 ? '男' : '女'}</View>
              </View>
            </View>
          ) : (
            ''
          )}
          {D.goodList
            ? D.goodList.map((item) => {
                return (
                  <View key={item.goods_name} className="goods-area">
                    <View className="li">
                      <View className="left">商品：</View>
                      <View className="right">
                        <AtAvatar image={item.pic_url} />
                        {item.goods_name}
                      </View>
                    </View>
                    <View className="li">
                      <View className="left">数量：</View>
                      <View className="right">{item.number}</View>
                    </View>
                    <View className="li">
                      <View className="left">价格：</View>
                      <View className="right">{item.actual_price}</View>
                    </View>
                    <View className="li">
                      <View className="left">规格：</View>
                      <View className="right">{item.specifition_names}</View>
                    </View>
                  </View>
                );
              })
            : ''}
        </View>
      </View>
    );
  }
}
