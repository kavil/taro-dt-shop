import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Image, Text, Form, Button } from '@tarojs/components';
import { AtInputNumber, AtButton } from 'taro-ui';
import { connect } from '@tarojs/redux';
import './goodsComponent.scss';
import cartImg from '../../static/images/cart-in.png';
import { tip, Countdown, getTime } from '../../utils/tool';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
  formIdArr: any[];
}

interface PageOwnProps {
  //父组件要传
  goods: any;
  onChange: Function;
  type?: 'mini' | null;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;

@connect(({ goods, common }) => ({
  ...goods,
  formIdArr: common.formIdArr,
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

  componentDidMount() {
    if (this.props.goods.over_time)
      this.setState({
        countdown: Countdown(this.props.goods.over_time),
      });
  }
  addCart = value => {
    console.log(value, 'addCart');
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

    if (value.goods_type !== 1) {
      if (getTime(value.start_time) > getTime()) {
        disabled = '还未开始 ' + value.start_time.split(' ')[1];
      } else if (getTime(value.over_time) < getTime()) {
        disabled = '已结束';
      } else {
        disabled = null;
      }
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

  state = {
    numberStatus: false,
    countdown: {},
  };

  render() {
    const { goods, type } = this.props;
    const { numberStatus }: any = this.state;
    let goodsNumber = 0;
    if (!goods.sku) return null;
    goods.sku.forEach(ele => {
      goodsNumber += ele.goods_number;
    });
    const { counter_price, retail_price, vip_price } = goods.sku[0];
    const className = 'goods-li' + (type === 'mini' ? ' mini' : '');

    return (
      <View className={className}>
        <Form reportSubmit onSubmit={this.getFormId}>
          <Button plain={true} formType="submit" className="img-wrap plain" onClick={this.nextPage}>
            {goods.goods_type === 1 && <Text className="type-tag erduufont ed-crd" />}
            {/* {goods.goods_type === 2 && <Text className="type-tag erduufont ed-ms" />} */}
            {goods.goods_type === 3 && <Text className="type-tag erduufont ed-ys" />}
            <Image lazyLoad className="img" src={goods.primary_pic_url + '@!200X200'} />
          </Button>
        </Form>
        <View className="right-wrap">
          <Form reportSubmit onSubmit={this.getFormId}>
            <Button plain={true} formType="submit" className="title plain" onClick={this.nextPage}>
              {goods.goods_name}
            </Button>
            <Button plain={true} formType="submit" className="desc plain" onClick={this.nextPage}>
              {goods.goods_brief}
            </Button>
            <Button
              plain={true}
              formType="submit"
              className="sale-wrap plain"
              onClick={this.nextPage}
            >
              <View
                className="sale-slide"
                style={{ width: (goodsNumber / (goods.sell_volume + goodsNumber)) * 100 + '%' }}
              />
              仅剩{goodsNumber}
              {goods.goods_unit}
            </Button>
          </Form>
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
