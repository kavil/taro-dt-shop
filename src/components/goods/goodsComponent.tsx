import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { AtInputNumber, AtButton } from 'taro-ui';
import { connect } from '@tarojs/redux';
import './goodsComponent.scss';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
}

interface PageOwnProps {
  //父组件要传
  goods: any;
  onChange: Function;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;

@connect(({ goods }) => ({
  ...goods,
}))
class Goods extends Component<IProps, {}> {
  static defaultProps = {
    goods: {},
    onChange: null,
  };
  // 有点麻烦 以后再做
  blurCartNumber = value => {
    console.log(value);
  };

  changeCartNumber = value => {
    console.log(value);
  };

  addCart = value => {
    console.log(value);
    // this.setState({ numberStatus: true });
    this.props.onChange(value);
    return this.props.dispatch({
      type: 'cart/add',
      payload: {
        goodsId: this.props.goods.goods_id,
        addNumber: value,
      },
    });
  };

  state = {
    numberStatus: false,
  };

  render() {
    const { goods } = this.props;
    const { numberStatus } = this.state;
    let goodsNumber = 0;
    let sellVolume = 0;
    if (!goods.sku) goods.sku = [];
    goods.sku.forEach(ele => {
      goodsNumber += ele.goods_number;
      sellVolume += ele.sell_volume;
    });
    const { counter_price, retail_price, vip_price } = goods.sku[0];
    return (
      <View className="goods-li">
        <View className="img-wrap">
          <Image className="img" src={goods.primary_pic_url + '@!480X480'} />
        </View>
        <View className="right-wrap">
          <View className="title">{goods.goods_name}</View>
          <View className="desc">{goods.goods_brief}</View>
          <View className="sale-wrap">
            <View
              className="sale-slide"
              style={{ width: (sellVolume + goodsNumber) / goodsNumber + '%' }}
            />
            仅剩{goodsNumber}
            {goods.goods_unit}
          </View>
          <View className="shopping-wrap">
            <View className="price">
              <View className="counter">￥{counter_price}</View>
              <View className="retail">小区价</View>
              <View className="vip">
                ￥{retail_price}
                <View className="label">会员{((vip_price / retail_price) * 10).toFixed(1)}折</View>
              </View>
            </View>
            <View className="shopping">
              {numberStatus ? (
                <AtInputNumber
                  min={0}
                  max={10}
                  step={1}
                  value={1}
                  type="digit"
                  onBlur={this.blurCartNumber}
                  onChange={this.changeCartNumber}
                />
              ) : (
                <AtButton
                  type="primary"
                  circle
                  size="small"
                  className="btn-shopping"
                  onClick={this.addCart.bind(this, 1)}
                >
                  马上抢
                </AtButton>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default Goods as ComponentClass<PageOwnProps, PageState>;
