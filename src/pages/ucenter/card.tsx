import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtSegmentedControl, AtCurtain } from 'taro-ui';
import { getTime, tip } from '../../utils/tool';
import { baseUrl } from '../../config/index';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  card: any;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ ucenter }) => ({
  ...ucenter,
}))
class Card extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '我的卡券',
  };

  async componentDidMount() {
    await this.props.dispatch({
      type: 'ucenter/Card',
    });
  }

  async onPullDownRefresh() {
    await this.componentDidMount();
    Taro.stopPullDownRefresh();
  }
  handleClick = async current => {
    this.setState({
      current,
    });
    await this.props.dispatch({
      type: 'ucenter/save',
      payload: {
        card: {
          ...this.props.card,
          used: !!current,
          page: 1, // 归位
          refresh: true,
          loadOver: false,
        },
      },
    });
    await this.getCardList();
  };
  async onReachBottom() {
    await this.props.dispatch({
      type: 'ucenter/save',
      payload: {
        card: {
          ...this.props.card,
          page: this.props.card.page + 1,
        },
      },
    });
    await this.getCardList();
  }
  getCardList() {
    this.props.dispatch({
      type: 'ucenter/Card',
    });
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
  useIt = async ele => {
    if (getTime(ele.use_end_date) < getTime()) {
      tip('已过期');
      return;
    }
    this.setState({
      isOpened: true,
      cur: {
        ...ele,
        png: `${baseUrl}/card/qr?code=${ele.checkcode}`,
      },
    });
  };

  onClose = () => {
    this.setState({ cur: null, isOpened: false });
  };

  nextPage(url) {
    Taro.navigateTo({ url });
  }

  state = {
    current: 0,
    curtainPng: '',
    cur: null,
  };

  render() {
    const { card } = this.props;
    const { current, isOpened, cur }: any = this.state;

    const { cardList } = card;

    const classText = ele => {
      const now = getTime();
      let res = 'cli';
      if (getTime(ele.use_end_date) < now) {
        res = 'cli disabled';
      }
      return res;
    };

    return (
      <View className="coupon-page card-page">
        <AtCurtain isOpened={isOpened} onClose={this.onClose.bind(this)}>
          <View className="cen">
            {cur.png && <Image className="curtainImg" src={cur.png} />}
            <View className="note">
              <View className="code">{cur.code}</View>请让「{cur.name}」的工作人员扫码核销
            </View>
          </View>
        </AtCurtain>
        <View className="pad40">
          <AtSegmentedControl
            values={['待使用', '已使用']}
            onClick={this.handleClick.bind(this)}
            current={current}
          />
        </View>
        <View className="card-ul">
          {cardList && cardList.length ? (
            cardList.map(ele => (
              <View key={ele.id} className={classText(ele)}>
                <View className="cicle l" />
                <View className="cicle r" />
                <View
                  className="head"
                  onClick={this.nextPage.bind(this, '/pages/shop/product?id=' + ele.productId)}
                >
                  <View className="title">{ele.name}</View>
                  <View className="p">{ele.desc}</View>
                  <View className="p">
                    有效期：{ele.use_start_date.split(' ')[0]} ~{' '}
                    {ele.use_end_date ? ele.use_end_date.split(' ')[0] : '无限制'}
                  </View>
                </View>
                <View className="ewm" onClick={this.useIt.bind(this, ele)}>
                  <Text className="erduufont ed-ewm" />
                </View>
                <View className="foot">
                  可用店铺
                  {ele.shop.map(s => (
                    <View className="foot-in" key={s.id}>
                      <View
                        className="sli"
                        onClick={this.nextPage.bind(this, '/pages/shop/index?id=' + ele.shopId)}
                      >
                        {s.name}
                      </View>
                      <View className="op-wrap">
                        <AtButton
                          type="secondary"
                          size="small"
                          className="bt"
                          onClick={this.makePhoneCall.bind(this, s.phone)}
                        >
                          电话
                        </AtButton>
                        <AtButton
                          type="secondary"
                          size="small"
                          className="bt"
                          onClick={this.navMap.bind(this, s)}
                        >
                          导航
                        </AtButton>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View className="nodata">
              <Text className="erduufont ed-zanwushuju" />
              <View className="label">暂无数据</View>
            </View>
          )}
        </View>
      </View>
    );
  }
}
export default Card as ComponentClass<PageOwnProps, PageState>;
