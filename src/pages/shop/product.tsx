import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Swiper, SwiperItem, Image, Text, RichText } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtActivityIndicator, AtTag, AtButton, AtList, AtListItem } from 'taro-ui';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ shop, loading }) => ({
  ...shop,
}))
class Product extends Component<IProps, {}> {
  config = {
    // navigationBarTitleText: '详情',
  };

  async componentDidMount() {
    const info = await this.props.dispatch({
      type: 'shop/ProductDetail',
      payload: {
        id: this.$router.params.id,
      },
    });
    this.setState({ info });
  }

  makePhoneCall(phoneNumber) {
    Taro.makePhoneCall({ phoneNumber });
  }
  navMap(item) {
    Taro.openLocation({
      latitude: item.lat,
      longitude: item.lng,
      name: item.address + item.name,
    });
  }
  clickDetail = a => {
    console.log(a);
  };

  lookBig = (img, imgList) => {
    console.log(img);
    const list = imgList.map(ele => ele + '@!q90');
    Taro.previewImage({
      current: img + '@!q90',
      urls: list,
    });
  };
  nextPage(url) {
    Taro.navigateTo({ url });
  }
  state = {
    info: null,
  };

  render() {
    const {} = this.props;
    const { info }: any = this.state;
    if (!info) return null;
    if (!info.content) return null;
    const imgList =
      info && info.list_pic_url ? info.list_pic_url.split(',') : [info ? info.avatar : ''];
    const detailNodes = '<div class="detail-wrap">' + info.content + '</div>';

    return (
      <View className="shop-page">
        <View className="wrap product">
          <View className="h4">
            <Text className="erduufont ed-dianpu" />
            {info.shop.name}
          </View>
          <View className="h2">{info.name}</View>
          <View className="swiper-wrap">
            <Swiper className="swiper" indicatorActiveColor="#f1836f">
              {imgList.map((ele, i) => (
                <SwiperItem key={i}>
                  <Image
                    onClick={this.lookBig.bind(this, ele, imgList)}
                    className="image"
                    src={ele + '@!750X350'}
                  />
                </SwiperItem>
              ))}
            </Swiper>
          </View>
          <View className="h5">{info.desc}</View>
          <View className="mr fj">
            <AtTag className="tag" active={true} circle>
              {info.shop.shop_type}
            </AtTag>
            <View className="p">
              {info.shop.city} · {info.shop.adname}
            </View>
          </View>
          <View className="wrap rich-wrap">
            <View className="h3">适用门店</View>
            <AtList hasBorder={false}>
              <AtListItem
                onClick={this.nextPage.bind(this, '/pages/shop/index?id=' + info.shop.id)}
                title={info.shop.name}
                hasBorder={false}
                arrow="right"
              />
            </AtList>
            <View className="li fj">
              <View className="left">
                <Text className="erduufont ed-location" />
                {info.shop.address}
              </View>
              <View className="right">
                <AtButton
                  type="secondary"
                  size="small"
                  className="bt"
                  onClick={this.navMap.bind(this, info.shop)}
                >
                  导航
                </AtButton>
              </View>
            </View>
            <View className="li fj">
              <View className="left">
                <Text className="erduufont ed-dianhua" />
                {info.shop.phone}
              </View>
              <View className="right">
                <AtButton
                  type="secondary"
                  size="small"
                  className="bt"
                  onClick={this.makePhoneCall.bind(this, info.shop.phone)}
                >
                  电话
                </AtButton>
              </View>
            </View>
          </View>
        </View>

        <View className="wrap rich-wrap">
          <View className="h3">项目详情</View>
          <RichText nodes={detailNodes} onClick={this.clickDetail.bind(this)} />
          <View className="h3">价格说明</View>
          <View className="p">
            <Text className="b">划线价格：</Text>
            指商品的专柜价、吊牌价、正品零售价、厂商指导价或该价格的曾经展示过 的销售价等, 并非原价,
            仅供参考。
          </View>
          <View className="p">
            <Text className="b">未划线价格：</Text>
            指商品的实时标价, 不因表述的差异改变性质。
            具体成交价格更具商品参加活动,或使用优惠券、积分等发生变化最终以订单结算页价格为准.
          </View>
        </View>
      </View>
    );
  }
}
export default Product as ComponentClass<PageOwnProps, PageState>;
