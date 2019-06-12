import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './productComponent.scss';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
}

interface PageOwnProps {
  //父组件要传
  item: any;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;

@connect(({ shop }) => ({
  ...shop,
}))
class Product extends Component<IProps, {}> {
  componentDidMount() {}

  nextPage(url) {
    Taro.navigateTo({ url });
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

  state = {};

  render() {
    const { item } = this.props;

    return (
      <View
        className="shop-li"
        onClick={this.nextPage.bind(this, '/pages/shop/product?id=' + item.id)}
      >
        <View className="img-wrap">
          <Image lazyLoad className="img" src={item.shop.avatar + '@!100X100'} />
        </View>
        <View className="right-wrap">
          <View className="title">{item.shop.name}</View>
          {/* <View className="desc">{item.desc}</View> */}
          <View key={item.id}>
            <View key={item.id} className="shop-type">
              {item.desc}
            </View>
            <View className="p">
              <View className="purple-tag">价值</View>
              <Text className="money">
                <Text className="small">￥</Text>
                {item.retail_price}
              </Text>
            </View>
          </View>
        </View>
        <View className="op-wrap">
          {/* <AtButton
            type="secondary"
            size="small"
            className="bt"
            onClick={this.navMap.bind(this, item)}
          >
            导航
          </AtButton> */}
        </View>
      </View>
    );
  }
}

export default Product as ComponentClass<PageOwnProps, PageState>;
