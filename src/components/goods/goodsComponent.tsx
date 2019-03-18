import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { AtInputNumber, AtButton } from 'taro-ui';
import { connect } from '@tarojs/redux';
import './goodsComponent.scss';
import cartImg from '../../static/images/cart-in.png';
import { tip, Countdown } from '../../utils/tool';

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
  type?: 'mini' | null;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;

@connect(({ goods }) => ({
  ...goods,
}))
class GoodsItem extends Component<IProps, {}> {
  static defaultProps = {
    goods: {},
  };
  // 有点麻烦 以后再做
  blurCartNumber = value => {
    console.log(value);
  };

  changeCartNumber = value => {
    console.log(value);
  };
  newDate = date => {
    if (!date) return 0;
    return new Date(date.replace(/-/g, '/'));
  };
  componentDidMount() {
    if (this.props.goods.over_time)
      this.setState({
        countdown: Countdown(this.props.goods.over_time),
      });
  }
  addCart = value => {
    console.log(value);
    // this.setState({ numberStatus: true });
    let goodsNumber = 0;
    if (!value.sku) value.sku = [];
    value.sku.forEach(ele => {
      goodsNumber += ele.goods_number;
    });

    let disabled;

    if (goodsNumber === 0) {
      disabled = '已售罄';
    }
    if (
      value.goods_type !== 1 &&
      this.newDate(value.over_time) <
        this.newDate(new Date().toLocaleString('zh', { hour12: false }))
    ) {
      disabled = '秒杀已结束';
    }
    if (disabled) {
      tip(disabled);
      return;
    }

    this.props.onChange(value);
  };

  onTimeUp() {}
  nextPage() {
    Taro.navigateTo({ url: `/pages/goods/index?id=${this.props.goods.id}` });
  }

  state = {
    numberStatus: false,
    countdown: {},
    noCommunityOpen: false,
  };

  render() {
    const { goods, type } = this.props;
    const { numberStatus, noCommunityOpen }: any = this.state;
    let goodsNumber = 0;
    if (!goods.sku) return null;
    goods.sku.forEach(ele => {
      goodsNumber += ele.goods_number;
    });
    const { counter_price, retail_price, vip_price } = goods.sku[0];
    const className = 'goods-li' + (type === 'mini' ? ' mini' : '');

    return (
      <View className={className}>
        <View className="img-wrap" onClick={this.nextPage}>
          {goods.goods_type === 1 && <Text className="type-tag erduufont ed-crd" />}
          {/* {goods.goods_type === 2 && <Text className="type-tag erduufont ed-ms" />} */}
          {goods.goods_type === 3 && <Text className="type-tag erduufont ed-ys" />}
          <Image lazyLoad className="img" src={goods.primary_pic_url + '@!200X200'} />
        </View>
        <View className="right-wrap">
          <View className="title" onClick={this.nextPage}>
            {goods.goods_name}
          </View>
          <View className="desc" onClick={this.nextPage}>
            {goods.goods_brief}
          </View>
          <View className="sale-wrap">
            <View
              className="sale-slide"
              style={{ width: (goodsNumber / (goods.sell_volume + goodsNumber)) * 100 + '%' }}
            />
            仅剩{goodsNumber}
            {goods.goods_unit}
          </View>
          <View className="shopping-wrap">
            <View className="price" onClick={this.nextPage}>
              <View className="retail">小区价</View>
              <View className="vip">
                ￥{retail_price.toFixed(1)}
                {vip_price !== retail_price && (
                  <View className="label">
                    会员再打{((vip_price / retail_price) * 10).toFixed(1)}折
                  </View>
                )}
              </View>
              {type !== 'mini' && <View className="counter">￥{counter_price.toFixed(1)}</View>}
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
              ) : type === 'mini' ? (
                <Image className="cartImg" src={cartImg} onClick={this.addCart.bind(this, goods)} />
              ) : (
                <AtButton
                  type="primary"
                  circle
                  size="small"
                  className="btn-shopping"
                  onClick={this.addCart.bind(this, goods)}
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

export default GoodsItem as ComponentClass<PageOwnProps, PageState>;
