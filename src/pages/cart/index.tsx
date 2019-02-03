import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtInputNumber } from 'taro-ui';
import CheckItem from '../../components/checkItem/checkItemComponent';
import Login from '../../components/login/loginComponent';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  cartList: any;
  cartTotal: any;
  userInfo: any;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ cart, common }) => ({
  ...cart,
  ...common,
}))
class Cart extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '购物车',
  };

  async componentDidShow() {
    const res = await this.props.dispatch({
      type: 'cart/Index',
    });
    if (res.errno === 401) {
      this.setState({
        nologin: true,
      });
    }
    this.setState({ checkAll: !this.props.cartList.find(ele => !ele.checked) });
  }
  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'cart/Index',
    });
    this.setState({ checkAll: !this.props.cartList.find(ele => !ele.checked) });
    Taro.stopPullDownRefresh();
  }
  loginBtn = () => {
    Taro.eventCenter.trigger('login', true);
  };
  loginSuccess = () => {
    this.onPullDownRefresh();
  };

  handleCheckAll = async value => {
    this.setState({ checkAll: value });
    await this.props.dispatch({
      type: 'cart/Check',
      payload: {
        isChecked: value ? 1 : 0,
        productIds: this.props.cartList.map(ele => ele.product_id),
      },
    });
  };
  checkItem = async (goods, value) => {
    await this.props.dispatch({
      type: 'cart/Check',
      payload: {
        isChecked: value ? 1 : 0,
        productIds: [goods.product_id],
      },
    });
    this.setState({ checkAll: !this.props.cartList.find(ele => !ele.checked) });
  };
  nextTab = url => {
    Taro.switchTab({ url });
  };
  nextPage(url) {
    Taro.navigateTo({ url });
  }
  changeCartNumber = async (goods, value) => {
    if (isNaN(value)) return;
    await this.props.dispatch({
      type: 'cart/Up',
      payload: {
        id: goods.id,
        goodsId: goods.goods_id,
        productId: goods.product_id,
        number: value,
      },
    });
  };
  delCart = async goods => {
    await this.props.dispatch({
      type: 'cart/Del',
      payload: {
        productIds: [goods.product_id],
      },
    });
  };
  state = {
    checkAll: false,
    nologin: false,
  };

  render() {
    const { cartList, cartTotal, userInfo } = this.props;
    const { checkAll, nologin } = this.state;

    return (
      <View className="cart-page">
        <Login show={false} onChange={this.loginSuccess} />
        {userInfo.level && (
          <View className="vip-bar">
            <View className="left">
              {userInfo.level === 0 ? (
                <View className="tag">开通会员</View>
              ) : (
                <View className="tag">您已开通会员</View>
              )}
              {cartTotal && (
                <Text className="text">
                  会员立省
                  <Text style={{ color: '#f5735b' }}>
                    {(cartTotal.checkedGoodsAmount - cartTotal.checkedGoodsVipAmount).toFixed(1)}
                  </Text>
                  元
                </Text>
              )}
            </View>
            <Text className="right">
              {userInfo.level === 0 ? '立即开通' : '续费'}
              <Text className="erduufont ed-back go" />
            </Text>
          </View>
        )}

        {cartList && cartList.length ? null : (
          <View className="nodata">
            <Text className="erduufont ed-zanwushangpin" />
            <View className="label">购物车是空的</View>
            {nologin ? (
              <AtButton size="small" type="secondary" onClick={this.loginBtn}>
                登录
              </AtButton>
            ) : (
              <AtButton
                size="small"
                type="secondary"
                onClick={this.nextTab.bind(this, '/pages/index/index')}
              >
                去逛逛
              </AtButton>
            )}
          </View>
        )}

        <View className="ul">
          {cartList.map(ele => (
            <View key={ele.id} className="li">
              <Text className="erduufont ed-shanchu" onClick={this.delCart.bind(this, ele)} />
              <View className="cb">
                <CheckItem
                  value={ele.id}
                  checked={!!ele.checked}
                  onChange={this.checkItem.bind(this, ele)}
                />
              </View>
              <View
                className="img-wrap"
                onClick={this.nextPage.bind(this, '/pages/goods/index?id=' + ele.goods_id)}
              >
                <Image className="img" src={ele.pic_url + '@!300X300'} />
              </View>
              <View className="right">
                <View className="b">{ele.goods_name}</View>
                <View className="p">{ele.specifition_names}</View>
                <View className="price-wrap">
                  {userInfo.level === 0 ? (
                    <View className="price">
                      <View className="retail">小区价</View>
                      <View className="vip">
                        ￥{(ele.retail_price * ele.number).toFixed(1)}
                        <View className="label">
                          会员{((ele.vip_price / ele.retail_price) * 10 * ele.number).toFixed(1)}折
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="price">
                      <View className="retail">会员价</View>
                      <View className="vip">
                        ￥{(ele.vip_price * ele.number).toFixed(1)}
                        <View className="label">
                          省{((ele.retail_price - ele.vip_price) * ele.number).toFixed(1)}元
                        </View>
                      </View>
                    </View>
                  )}
                </View>
                <View className="input-number">
                  <AtInputNumber
                    min={1}
                    max={100}
                    step={1}
                    value={ele.number}
                    type="number"
                    width={70}
                    onBlur={this.changeCartNumber.bind(this, ele)}
                    onChange={this.changeCartNumber.bind(this, ele)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
        {cartList && cartList.length ? (
          <View className="bottom">
            <View className="check-wrap">
              <CheckItem
                checked={checkAll}
                value="all"
                label="全选"
                onChange={this.handleCheckAll}
              />
            </View>
            {userInfo.level === 0 ? (
              <View className="cart-wrap">
                合计
                <Text className="main-color">￥{cartTotal.checkedGoodsAmount.toFixed(1)}</Text>
                {cartTotal.checkedGoodsAmount >= 49 ? (
                  <Text className="info-color">免配送费</Text>
                ) : null}
              </View>
            ) : (
              <View className="cart-wrap">
                合计
                <Text className="main-color">
                  ￥
                  {cartTotal && cartTotal.checkedGoodsVipAmount
                    ? cartTotal.checkedGoodsVipAmount.toFixed(1)
                    : 0}
                </Text>
                {cartTotal.checkedGoodsVipAmount >= 39 ? (
                  <Text className="info-color">免配送费</Text>
                ) : null}
              </View>
            )}
            <View className="add-cart">
              <AtButton
                type="primary"
                disabled={
                  userInfo.level === 0
                    ? cartTotal.checkedGoodsAmount === 0
                    : cartTotal.checkedGoodsVipAmount === 0
                }
                onClick={this.nextPage.bind(this, '/pages/cart/checkout')}
              >
                去结算
              </AtButton>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}
export default Cart as ComponentClass<PageOwnProps, PageState>;
