import Taro, { Component, Config } from '@tarojs/taro';
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
  Form,
} from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtActivityIndicator, AtSteps, AtCountdown, AtButton } from 'taro-ui';
import GoodsItem from '../../components/goods/goodsComponent';
import Sku from '../../components/sku/skuComponent';
import Login from '../../components/login/loginComponent';
import { tip, Countdown } from '../../utils/tool';
const qulity1 = 'https://img.kavil.com.cn/3991547959471_.pic.jpg';
const qulity2 = 'https://img.kavil.com.cn/4011547959487_.pic.jpg';
import { goodsShare } from '../../config/goodsShare';
import { baseUrl } from '../../config/index';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
  Detail: any;
  cartTotal: any;
  userInfo: any;
  formIdArr: any[];
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ goods, cart, common }) => ({
  ...goods,
  ...cart,
  ...common,
}))
class Goods extends Component<IProps, {}> {
  config: Config = {
    usingComponents: {
      canvasdrawer: '../../components/canvasdrawer/canvasdrawer',
    },
  };

  async componentDidShow() {
    if (this.$router.params.scene) {
      const sceneTmp = decodeURIComponent(this.$router.params.scene);
      const scene: any = {};
      sceneTmp.split('&').forEach(ele => {
        const res = ele.split('=');
        scene[res[0]] = res[1];
      });
      console.log(scene, 'thasdfter.scene');
      this.$router.params.id = scene.id;
    }

    Taro.showShareMenu({
      withShareTicket: true,
    });
    await this.props.dispatch({
      type: 'goods/Detail',
      payload: {
        id: this.$router.params.id,
      },
    });
    if (this.props.Detail.info.over_time) {
      const countdown = Countdown(this.props.Detail.info.over_time);
      this.setState({
        countdown,
      });
    }
    await this.props.dispatch({
      type: 'cart/Index',
    });
  }
  onShareAppMessage() {
    return {
      title: this.props.Detail.info.goods_name,
      // path: `/pages/goods/index?id=${this.$router.params.id}`,
    };
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
    if (this.props.Detail.info.over_time) {
      const countdown = Countdown(this.props.Detail.info.over_time);
      this.setState({
        countdown,
      });
    }
    Taro.stopPullDownRefresh();
  }
  nextPage = url => {
    Taro.navigateTo({ url });
  };
  loginSuccess = async _ => {
    await this.props.dispatch({
      type: 'cart/Index',
    });
  };

  onChangeStep = () => {};
  onTimeUp = () => {
    this.onPullDownRefresh();
  };
  clickDetail = a => {
    console.log(a);
  };
  addCartOk = async goods => {
    if (goods.sku.length > 1) {
      // 调出 选择规格组件
      this.setState({ curGoods: goods, openSku: true });
    } else {
      const res = await this.props.dispatch({
        type: 'cart/Add',
        payload: {
          productId: goods.sku[0].id,
          goodsId: goods.id,
        },
      });
      if (res.errno === 0)
        setTimeout(() => {
          tip('已添加到购物车');
        }, 90);
      if (res.errno === 401) Taro.eventCenter.trigger('login', true);
    }
  };
  handleCloseSku = () => {
    this.setState({ openSku: false });
  };
  handleChangeSku = async payload => {
    console.log('handleSkuOk', payload);
    // 加入购物车
    const res = await this.props.dispatch({
      type: 'cart/Add',
      payload,
    });
    if (res.errno === 0)
      setTimeout(() => {
        tip('已添加到购物车');
      }, 90);
    if (res.errno === 401) Taro.eventCenter.trigger('login', true);
  };

  lookBig = (img, no) => {
    const bigImg = no ? img : img + '@!q90';
    Taro.previewImage({
      current: bigImg,
      urls: [bigImg],
    });
  };

  nextTab(url) {
    Taro.switchTab({ url });
  }

  shareBtn = async () => {
    this.setState({
      shareStart: true,
    });
    // Taro.showLoading({
    //   title: '分享图生成中',
    // });

    const ewm = `${baseUrl}/index/getWXACodeUnlimit?id=${this.$router.params.id}&userId=${
      this.props.userInfo.id
    }&page=pages/goods/index&width=280px`;
    this.setState({ goodsShare: goodsShare(this.props.userInfo, this.props.Detail.info, ewm) });
  };

  onOpenSetting() {
    this.setState({ checkSave: true }, () => {
      this.saveImage();
    });
  }

  async saveImage() {
    if (!this.state.shareImage) return;

    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: this.state.shareImage || '',
      });

      if (res.errMsg === 'saveImageToPhotosAlbum:ok') {
        tip('保存图片成功');
        this.closeShare();
        return;
      }
    } catch (res) {
      if (res.errMsg === 'saveImageToPhotosAlbum:fail cancel') {
        tip('未保存');
        return;
      }
      if (res.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
        tip('无权限');
        this.setState({ checkSave: false });
        return;
      }
    }
  }

  closeShare() {
    this.setState({
      shareStart: false,
    });
  }

  eventGetImage(event) {
    console.log(event);
    const { tempFilePath, errMsg } = event.detail;
    Taro.hideLoading();
    if (errMsg === 'canvasdrawer:ok') {
      this.setState({
        shareImage: tempFilePath,
      });
    }
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
    openSku: false,
    curGoods: {},
    countdown: {},
    goodsShare: {},
    shareImage: null,
    shareStart: false,
    checkSave: true,
  };

  render() {
    const {
      openSku,
      curGoods,
      countdown,
      goodsShare,
      shareImage,
      shareStart,
      checkSave,
    }: any = this.state;
    const { Detail, cartTotal, userInfo } = this.props;
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

    let disabled;
    if (!info.is_on_sale || info.is_delete) {
      disabled = '已下架';
    }
    if (goodsNumber === 0) {
      disabled = '已售罄';
    }

    const now = new Date().toLocaleString('zh', { hour12: false });
    // 秒杀

    // console.log(countdown);
    const newDate = date => {
      if (!date) return 0;
      return new Date(date.replace(/-/g, '/'));
    };
    // 预售
    let current = 0;
    if (newDate(info.over_time) > newDate(now)) current = 1;
    if (newDate(info.over_time) < newDate(now)) current = 2;
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

    if (info.goods_type !== 1 && newDate(info.over_time) < newDate(now)) {
      disabled = '已结束';
    }
    const detailNodes = '<div class="detail-wrap">' + info.goods_desc + '</div>';
    return (
      <View className="goods-page">
        <Login show={false} onChange={this.loginSuccess} />

        {shareStart && (
          <View>
            <View className="curtain" onClick={this.closeShare} />
            {shareImage ? (
              <Image
                className="shareImage"
                mode="widthFix"
                src={shareImage}
                onClick={this.lookBig.bind(this, shareImage)}
              />
            ) : (
              <AtActivityIndicator
                content="分享图生成中"
                className="center loading"
                size={80}
                mode="center"
                color="#fff"
              />
            )}
            <Form reportSubmit onSubmit={this.getFormId}>
              <View className="share-bottom">
                <Button
                  className="share-item"
                  plain={true}
                  open-type="share"
                  formType="submit"
                  onClick={this.closeShare}
                >
                  <Text className="erduufont ed-weixin" />
                  分享群或好友
                </Button>
                {checkSave ? (
                  <Button
                    className="share-item"
                    plain={true}
                    formType="submit"
                    onClick={this.saveImage}
                  >
                    <Text className="erduufont ed-xiazai" />
                    保存图片分享
                  </Button>
                ) : (
                  <View className="share-item">
                    <View className="mt30">
                      <AtButton
                        className="share-set"
                        type="primary"
                        circle
                        size="small"
                        formType="submit"
                        open-type="openSetting"
                        onOpenSetting={this.onOpenSetting}
                      >
                        打开保存图片授权
                      </AtButton>
                    </View>
                  </View>
                )}
              </View>
            </Form>
          </View>
        )}
        <canvasdrawer painting={goodsShare} ongetImage={this.eventGetImage} />
        <Form reportSubmit onSubmit={this.getFormId}>
          <Button className="share-btn plain" plain formType="submit" onClick={this.shareBtn}>
            <Text className="erduufont ed-share" />
            分享
          </Button>
        </Form>

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
          {info.goods_type >= 2 ? (
            <View className="miaosha-wrap">
              <View className="trapezoid" />
              {newDate(info.start_time) > newDate(now) ? (
                <View className="miaosha">
                  <View>{info.start_time}开始</View>
                </View>
              ) : (
                <View>
                  {newDate(info.over_time) > newDate(now) ? (
                    <View>
                      {countdown.time ? (
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
                      ) : null}
                    </View>
                  ) : (
                    <View className="miaosha end">已结束</View>
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
            <View className="retail">
              小区价
              <View className="counter">￥{info.sku[0].counter_price.toFixed(1)}</View>
            </View>
            <View className="vip">
              ￥{info.sku[0].retail_price.toFixed(1)}
              {info.sku[0].vip_price !== info.sku[0].retail_price && (
                <View className="label">
                  会员再打{((info.sku[0].vip_price / info.sku[0].retail_price) * 10).toFixed(1)}折
                </View>
              )}
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
          <Form reportSubmit onSubmit={this.getFormId}>
            <Button
              plain
              formType="submit"
              className="vip-bar plain"
              onClick={this.nextPage.bind(this, '/pages/vip/index')}
            >
              <View className="left">
                {userInfo && userInfo.level !== 0 ? (
                  <View className="tag">您已开通会员</View>
                ) : (
                  <View className="tag">开通会员</View>
                )}
                <Text className="text">
                  会员立省
                  <Text style={{ color: '#f5735b' }}>
                    {(info.sku[0].retail_price - info.sku[0].vip_price).toFixed(1)}
                  </Text>
                  元
                </Text>
              </View>
              <Text className="right">
                {userInfo && userInfo.level !== 0 ? '续费' : '立即开通'}
                <Text className="erduufont ed-back go" />
              </Text>
            </Button>
          </Form>
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
                    <GoodsItem key={ele.id} type="mini" goods={ele} onChange={this.addCartOk} />
                  ))
                : null}
            </View>
          </ScrollView>
        </View>
        <View className="wrap rich-wrap">
          <View className="h3">商品详情</View>
          <RichText nodes={detailNodes} onClick={this.clickDetail.bind(this)} />

          <View className="h3">发货须知</View>
          <View className="p">
            <View>当天下午20:30前下单，次日上午送达；</View>
            <View>当天下午20:30后下单，后天上午送达；</View>
            <View>如标明预售则按预售日期发货配送。</View>
          </View>

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
        <Form reportSubmit onSubmit={this.getFormId}>
          <View className="bottom">
            <Button
              formType="submit"
              className="zhuye-wrap plain"
              plain
              onClick={this.nextTab.bind(this, '/pages/index/index')}
            >
              <Text className="erduufont ed-zhuye1" />
            </Button>
            <Button
              formType="submit"
              className="cart-wrap plain"
              plain
              onClick={this.nextTab.bind(this, '/pages/cart/index')}
            >
              <View className="badge">{cartTotal.checkedGoodsCount || 0}</View>
              <Text className="erduufont ed-gouwuche" />
            </Button>
            <View className="add-cart">
              <AtButton
                type="primary"
                formType="submit"
                disabled={!!disabled}
                onClick={this.addCartOk.bind(this, info)}
              >
                {disabled || '加入购物车'}
              </AtButton>
            </View>
          </View>
        </Form>
        {openSku ? (
          <Sku goods={curGoods} onChange={this.handleChangeSku} onClose={this.handleCloseSku} />
        ) : null}
      </View>
    );
  }
}
export default Goods as ComponentClass<PageOwnProps, PageState>;
