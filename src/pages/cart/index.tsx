import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image, Button, Form } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import {
  AtButton,
  AtInputNumber,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
} from 'taro-ui';
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
  formIdArr: any[];
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
    } else {
      this.setState({
        nologin: false,
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
  getFormId = e => {
    const formId = e.detail.formId;
    const formIdArr = [...this.props.formIdArr];
    formIdArr.push({ formId, createdTime: Math.floor(new Date().getTime() / 1000) });
    console.log(formIdArr, '<---------------------formIdArr');
    this.props.dispatch({
      type: 'common/save',
      payload: {
        formIdArr,
      },
    });
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

  nextPage(url, ex) {
    if (ex === 'noCheckout') {
      if (this.props.userInfo && !this.props.userInfo.colonelId) {
        this.setState({ noCommunityOpen: true });
        return;
      }
    }
    if (ex === 'noOpen') this.onCloseOpen();
    Taro.navigateTo({ url });
  }
  onCloseOpen = () => {
    this.setState({ noCommunityOpen: false });
  };
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
    noCommunityOpen: false,
  };

  render() {
    const { cartList, cartTotal, userInfo } = this.props;
    const { checkAll, nologin, noCommunityOpen } = this.state;

    return (
      <View className="cart-page">
        <Login show={false} onChange={this.loginSuccess} />

        <AtModal isOpened={noCommunityOpen}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>本小区暂无小区长，请选择绑定附近小区作为代收点。</AtModalContent>
          <AtModalAction>
            <Button
              type="primary"
              onClick={this.nextPage.bind(this, '/pages/neighbor/search', 'noOpen')}
            >
              去更换小区
            </Button>
          </AtModalAction>
        </AtModal>

        <Form reportSubmit onSubmit={this.getFormId}>
          {userInfo.id && (
            <Button plain formType="submit" className="plain" onClick={this.nextPage.bind(this, '/pages/vip/index')}>
              <View className="vip-bar">
                <View className="left">
                  {userInfo.level === 0 ? (
                    <View className="tag">开通会员</View>
                  ) : (
                    <View className="tag">您已开通会员</View>
                  )}
                  {cartTotal && cartTotal.checkedGoodsAmount - cartTotal.checkedGoodsVipAmount > 0 && (
                    <Text className="text">
                      会员立省
                      <Text style={{ color: '#f5735b' }}>
                        {(cartTotal.checkedGoodsAmount - cartTotal.checkedGoodsVipAmount).toFixed(
                          1
                        )}
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
            </Button>
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
                  formType="submit"
                  size="small"
                  type="secondary"
                  onClick={this.nextTab.bind(this, '/pages/index/index')}
                >
                  去逛逛
                </AtButton>
              )}
            </View>
          )}
        </Form>

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
                          会员仅{ele.vip_price.toFixed(1)}元
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
                <Text className="main-color">
                  ￥{cartTotal.checkedGoodsAmount ? cartTotal.checkedGoodsAmount.toFixed(1) : ''}
                </Text>
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
              <Form reportSubmit onSubmit={this.getFormId}>
                <AtButton
                  type="primary"
                  formType="submit"
                  disabled={
                    userInfo.level === 0
                      ? cartTotal.checkedGoodsAmount === 0
                      : cartTotal.checkedGoodsVipAmount === 0
                  }
                  onClick={this.nextPage.bind(this, '/pages/cart/checkout', 'noCheckout')}
                >
                  去结算
                </AtButton>
              </Form>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}
export default Cart as ComponentClass<PageOwnProps, PageState>;
