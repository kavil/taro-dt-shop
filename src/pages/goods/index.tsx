import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import {
  View,
  Swiper,
  Image,
  SwiperItem,
  Text,
  RichText,
  ScrollView,
  Button,
} from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtActivityIndicator, AtSteps, AtCountdown, AtButton } from 'taro-ui';
import GoodsItem from '../../components/goods/goodsComponent';
const qulity1 = 'https://img.kavil.com.cn/3991547959471_.pic.jpg';
const qulity2 = 'https://img.kavil.com.cn/4011547959487_.pic.jpg';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  Detail: any;
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ goods, loading }) => ({
  ...goods,
}))
class Goods extends Component<IProps, {}> {
  async componentDidMount() {
    Taro.showShareMenu({
      withShareTicket: true,
    });
    await this.props.dispatch({
      type: 'goods/Detail',
      payload: {
        id: this.$router.params.id,
      },
    });
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'goods/clearDetail',
    });
  }
  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'goods/Detail',
      payload: {
        id: this.$router.params.id,
      },
    });
    Taro.stopPullDownRefresh();
  }

  countdown = over_time => {
    const cha = (new Date(over_time).getTime() - new Date().getTime()) / 1000;
    const isShowDay = cha > 86400;
    const day = Math.floor(cha / 86400);
    const time: any = [];
    const lasthour = cha - 86400 * day;
    time.push(Math.floor(lasthour / 3600));
    const lastMin = lasthour - 3600 * time[0];
    time.push(Math.floor(lastMin / 60));
    const lastSec = lastMin - 60 * time[1];
    time.push(lastSec);
    return { isShowDay, day, time };
  };
  onChangeStep = () => {};
  onTimeUp = () => {
    this.onPullDownRefresh();
  };
  clickDetail = a => {
    console.log(a);
  };
  addCartOk = a => {
    console.log(a);
  };
  lookBig = img => {
    console.log(img);

    Taro.previewImage({
      current: img + '@!q90',
      urls: [img + '@!q90'],
    });
  };

  render() {
    const { Detail } = this.props;
    if (!Detail.info)
      return <AtActivityIndicator className="center" mode="center" color="#f1836f" />;

    const { info, selledUsers, issueList, recommendList } = Detail;
    if (!info) return null;
    let imgList = [];
    if (info) imgList = info.list_pic_url.split(',');
    let goodsNumber = 0;
    if (!info.sku) info.sku = [];
    info.sku.forEach(ele => {
      goodsNumber += ele.goods_number;
    });

    const now = new Date().toLocaleString('zh', { hour12: false });
    // 秒杀
    const countdown = this.countdown(info.over_time);

    // 预售
    let current = 0;
    if (info.over_time > now) current = 1;
    if (info.over_time < now) current = 2;
    const formate = date => {
      if (!date) return '';
      return date.substr(5, 5);
    };
    const type3 = {
      items: [
        { title: formate(info.start_time) + '开始', icon: { value: 'clock' } },
        { title: formate(info.over_time) + '结束', icon: { value: 'shopping-bag-2' } },
        { title: formate(info.predict_time) + '预计发货', icon: { value: 'lightning-bolt' } },
      ],
      current,
    };

    const detailNodes = '<div class="detail-wrap">' + info.goods_desc + '</div>';
    return (
      <View className="goods-page">
        <View className="swiper-wrap">
          {info.goods_type > 1 ? (
            <View className="goods-type-wrap">
              <View className="ribbon" />
              <View className="ribbon-text">{info.goods_type === 2 ? '秒杀' : '预售'}</View>
            </View>
          ) : null}
          <Swiper className="swiper" indicatorDots indicatorActiveColor="#f1836f" autoplay>
            {imgList.map((ele, i) => (
              <SwiperItem key={i}>
                <Image className="image" src={ele + '@!750X500'} />
              </SwiperItem>
            ))}
          </Swiper>
          {info.goods_type === 2 ? (
            <View className="miaosha-wrap">
              <View className="trapezoid" />
              {info.start_time > now ? (
                <View className="miaosha">
                  即将开始
                  <View>info.start_time</View>
                </View>
              ) : (
                <View>
                  {info.over_time > now ? (
                    <View className="miaosha">
                      马上结束
                      <AtCountdown
                        format={{ day: '天', hours: ':', minutes: ':', seconds: '' }}
                        isShowDay={countdown.isShowDay}
                        day={countdown.day}
                        hours={countdown.time[0]}
                        minutes={countdown.time[1]}
                        seconds={countdown.time[2]}
                        onTimeUp={this.onTimeUp.bind(this)}
                      />
                    </View>
                  ) : (
                    <View className="miaosha end">秒杀已结束</View>
                  )}
                </View>
              )}
            </View>
          ) : null}
        </View>
        {info.sell_volume > 10 ? (
          <View className="selled-wrap">
            <View className="selled">
              已售 {info.sell_volume} {info.goods_unit}
            </View>
          </View>
        ) : null}
        <View className="price-wrap">
          <View className="price">
            <View className="retail">小区价</View>
            <View className="vip">
              ￥{info.sku[0].retail_price}
              <View className="counter">￥{info.sku[0].counter_price}</View>
              <View className="label">
                会员{((info.sku[0].vip_price / info.sku[0].retail_price) * 10).toFixed(1)}折
              </View>
            </View>
          </View>
          {selledUsers && selledUsers.data.length ? (
            <View className="selledUsers">
              {selledUsers.data.map((ele, i) => (
                <Image key={i} className="image" src={ele.userInfo.avatarUrl} />
              ))}
              <Text className="text">等刚刚购买</Text>
            </View>
          ) : null}
        </View>
        <View className="wrap">
          <View className="h3">{info.goods_name}</View>
          <View className="desc">{info.goods_brief}</View>
          <View className="sale-wrap">
            <View
              className="sale-slide"
              style={{ width: (goodsNumber / (info.sell_volume + goodsNumber)) * 100 + '%' }}
            />
            仅剩{goodsNumber}
            {info.goods_unit}
          </View>
          <View className="vip-bar">
            <View className="tag">开通会员</View>
            <Text className="text">
              会员立省{(info.sku[0].retail_price - info.sku[0].vip_price).toFixed(1)}元
            </Text>
          </View>

          {info.goods_type === 3 ? (
            <AtSteps
              className="steps"
              items={type3.items}
              current={type3.current}
              onChange={this.onChangeStep.bind(this)}
            />
          ) : null}
        </View>
        <View className="wrap reco-wrap">
          <View className="h3">推荐商品</View>
          <ScrollView scrollX={true}>
            <View className="scroll-view-wrap">
              {recommendList && recommendList.length
                ? recommendList.map(ele => (
                    <GoodsItem type="mini" goods={ele} onChange={this.addCartOk} />
                  ))
                : null}
            </View>
          </ScrollView>
        </View>
        <View className="wrap rich-wrap">
          <View className="h3">商品详情</View>
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
            具体成交价格更具商品参加活动,或会员使用优惠券、积分等发生变化最终以订单结算页价格为准.
          </View>
          <View className="p">
            <Text className="b">会员价格：</Text>
            指在商品的实时标价上进行打折, 不因表述的差异改变性质。仅针对新邻居平台会员。
          </View>
          <View className="h3">工商资质</View>
          <View className="qulity-wrap">
            <Image
              onClick={this.lookBig.bind(this, qulity1)}
              className="image"
              src={qulity1 + '@!300X300'}
            />
            <Image
              onClick={this.lookBig.bind(this, qulity2)}
              className="image"
              src={qulity2 + '@!300X300'}
            />
          </View>
        </View>
        <View className="bottom">
          <View className="zhuye-wrap">
            <Text className="erduufont ed-zhuye1" />
          </View>
          <View className="cart-wrap">
            <Text className="erduufont ed-gouwuche" />
          </View>
          <View className="add-cart">
            <AtButton type="primary" onClick={this.addCartOk}>
              加入购物车
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}
export default Goods as ComponentClass<PageOwnProps, PageState>;
