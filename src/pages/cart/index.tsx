import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtInputNumber } from 'taro-ui';
import CheckItem from '../../components/checkItem/checkItemComponent';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  cartList: any;
  cartTotal: any;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ cart, loading }) => ({
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
  handleCheckAll = e => {
    console.log(e);
  };
  checkItem = e => {
    console.log(e);
  };
  checkOut = () => {};
  nextPage(url) {
    Taro.navigateTo({ url });
  }
  blurCartNumber = () => {};
  changeCartNumber = (a, b, c) => {
    console.log(a, b, c);
  };
  state = {};

  render() {
    const { cartList, cartTotal } = this.props;
    const {} = this.state;
    return (
      <View className="cart-page">
        <View className="vip-bar">
          <View className="tag">开通会员</View>
          <Text className="text">会员立省 111 元</Text>
        </View>

        <View className="ul">
          {cartList.map(ele => (
            <View className="li">
              <Text className="erduufont ed-shanchu" />
              <View className="cb">
                <CheckItem value={ele.id} checked={!!ele.checked} onChange={this.checkItem} />
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
                    min={0}
                    max={10}
                    step={1}
                    value={1}
                    type="number"
                    width={70}
                    onBlur={this.blurCartNumber}
                    onChange={this.changeCartNumber.bind(this, ele)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
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
      </View>
    );
  }
}
export default Cart as ComponentClass<PageOwnProps, PageState>;
