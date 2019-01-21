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

@connect(({ cart }) => ({
  ...cart,
}))
class Cart extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '购物车',
  };

  async componentDidShow() {
    await this.props.dispatch({
      type: 'cart/Index',
    });
  }
  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'cart/Index',
    });
    Taro.stopPullDownRefresh();
  }
  loginSuccess = _ => {
    this.componentDidShow();
  };
  handleCheckAll = async value => {
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
  };
  checkOut = () => {};
  nextTab = url => {
    Taro.switchTab({ url });
  };
  nextPage(url) {
    Taro.navigateTo({ url });
  }
  changeCartNumber = async (goods, value) => {
    if (isNaN(value)) return;
    console.log(goods, value);
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
  state = {};

  render() {
    const { cartList, cartTotal, userInfo } = this.props;
    const {} = this.state;
    return (
      <View className="cart-page">
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
                  {cartTotal.checkedGoodsAmount - cartTotal.checkedGoodsVipAmount}
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

        {cartList && cartList.length ? null : (
          <View className="nodata">
            <Text className="erduufont ed-zanwushangpin" />
            <View className="label">购物车是空的</View>
            <AtButton
              size="small"
              type="secondary"
              onClick={this.nextTab.bind(this, '/pages/index/index')}
            >
              去逛逛
            </AtButton>
          </View>
        )}

        <View className="ul">
          {cartList.map(ele => (
            <View key={ele.id} className="li">
              <Text className="erduufont ed-shanchu" />
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
                  <View className="price">
                    <View className="retail">小区价</View>
                    <View className="vip">
                      ￥{ele.retail_price}
                      <View className="label">
                        会员{((ele.vip_price / ele.retail_price) * 10).toFixed(1)}折
                      </View>
                    </View>
                  </View>
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
              <CheckItem value="all" label="全选" onChange={this.handleCheckAll} />
            </View>
            <View className="cart-wrap">
              合计
              <Text className="main-color">￥{cartTotal.checkedGoodsAmount}</Text>
              {cartTotal.checkedGoodsAmount >= 49 ? <Text className="info-color">免邮</Text> : null}
            </View>
            <View className="add-cart">
              <AtButton type="primary" onClick={this.checkOut}>
                去结算
              </AtButton>
            </View>
          </View>
        ) : null}
        <Login show={false} onChange={this.loginSuccess} />
      </View>
    );
  }
}
export default Cart as ComponentClass<PageOwnProps, PageState>;
