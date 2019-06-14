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
import { AtActivityIndicator, AtSteps, AtCountdown, AtButton, AtTag } from 'taro-ui';
import GoodsItem from '../../components/goods/goodsComponent';
import Product from '../../components/product/productComponent';
import Sku from '../../components/sku/skuComponent';
import Login from '../../components/login/loginComponent';
import { tip, Countdown, getTime } from '../../utils/tool';
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

@connect(({ goods, cart, common, neighbor, shop }) => ({
  ...goods,
  ...cart,
  ...common,
  ...neighbor,
  ...shop,
}))
class Goods extends Component<IProps, {}> {
  config: Config = {
    usingComponents: {
      canvasdrawer: '../../components/canvasdrawer/canvasdrawer',
    },
  };

  async componentDidShow() {
    const rp = this.$router.params;
    let id = rp.id;
    let communityId = rp.c;
    let fromUserId = rp.f;
    let shopPlanId = rp.p;
    let nowStr = rp.n;
    let scene = rp.scene;

    if (scene) {
      const sceneTmp = decodeURIComponent(scene);
      const _scene: any = {};
      sceneTmp.split('&').forEach(ele => {
        const res = ele.split('=');
        _scene[res[0]] = res[1];
      });
      id = _scene.id;
      communityId = _scene.c;
      fromUserId = _scene.f;
      shopPlanId = _scene.p;
      nowStr = _scene.n;
      console.log(_scene);
    }
    console.log(rp);

    if (
      !shopPlanId &&
      nowStr &&
      getTime(new Date().getFullYear() + '/' + nowStr) + 86400000 < getTime()
    ) {
      const res = await Taro.showModal({
        title: '提示',
        content: `该链接已过期，点击确定回到首页`,
        showCancel: false,
      });
      if (res) {
        Taro.switchTab({ url: '/pages/index/index' });
      }
    }

    if (shopPlanId) {
      // 检测是否购买过
      const hasNum = await this.props.dispatch({
        type: 'common/HasGoods',
        payload: {
          goodsId: id,
        },
      });
      if (hasNum > 0) {
        this.setState({ hasNum });
      }
    }

    this.setState({ id, communityId, fromUserId, shopPlanId });
    console.log({ id, communityId, fromUserId, shopPlanId });

    Taro.showShareMenu();
    this.props.dispatch({
      type: 'cart/Index',
    });
    await this.props.dispatch({
      type: 'goods/Detail',
      payload: {
        id,
      },
    });

    this.timeSe();
  }
  componentDidMount() {
    setTimeout(async () => {
      const { shopPlanId } = this.state;
      if (shopPlanId) {
        const { data } = await this.props.dispatch({
          type: 'shop/ProductList',
          payload: {
            shopPlanId,
          },
        });
        this.setState({ productList: data });
      }
    }, 500);
  }

  timeSe() {
    const Info = this.props.Detail.info;

    let goodsNumber = 0;
    if (!Info.sku) Info.sku = [];
    Info.sku.forEach(ele => {
      goodsNumber += ele.goods_number;
    });
    let disabled;
    if (!Info.is_on_sale || Info.is_delete) {
      disabled = '已下架';
    }
    if (goodsNumber === 0) {
      disabled = '已售罄';
    }

    if (Info.goods_type !== 1) {
      if (getTime(Info.start_time) > getTime()) {
        disabled = '马上开始 ' + Info.start_time.split(' ')[1];
      } else if (getTime(Info.over_time) < getTime()) {
        disabled = '已结束';
      } else {
        disabled = null;
      }
    }
    this.setState({
      disabled,
      goodsNumber,
    });

    if (getTime() < getTime(Info.start_time)) {
      const countdown = Countdown(Info.start_time);
      this.setState({
        countdown,
      });
      return;
    }
    if (getTime() < getTime(Info.over_time)) {
      const countdown = Countdown(Info.over_time);
      this.setState({
        countdown,
      });
      return;
    }
  }
  onShareAppMessage() {
    const { shopPlanId, id } = this.state;
    const { userInfo, Detail } = this.props;

    if (shopPlanId) {
      let path = `/pages/goods/index?id=${id}&c=${userInfo.communityId}&p=${shopPlanId}`;
      if (this.state.hasNum)
        path = `/pages/goods/index?id=${id}&f=${userInfo.id}&c=${
          userInfo.communityId
        }&p=${shopPlanId}`;
      return {
        title: `全城吃喝玩乐嗨通通免费，我是「${userInfo.nickName}」，邀您一起来狂欢`,
        path,
        imageUrl: Detail.share_img,
      };
    }

    const now = new Date();
    const nowStr = `${now.getMonth() + 1}/${now.getDate()}`;

    return {
      title: `【${now.getMonth() + 1}月${now.getDate()}日】 ${Detail.info.goods_name}`,
      path: `/pages/goods/index?id=${this.state.id}&f=${userInfo.id}&c=${
        userInfo.communityId
      }&n=${nowStr}`,
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
        id: this.state.id,
      },
    });
    this.timeSe();
    Taro.stopPullDownRefresh();
  }
  nextPage = url => {
    Taro.navigateTo({ url });
  };
  loginSuccess = async _ => {
    // await this.props.dispatch({
    //   type: 'cart/Index',
    // });
    this.addCartOk(this.props.Detail.info);
  };

  onChangeStep = () => {};

  avoid = false;
  onTimeUp = async () => {
    if (this.avoid) return;
    this.avoid = true;
    setTimeout(async () => {
      await this.onPullDownRefresh();
      this.avoid = false;
    }, 1000);
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
  submitShop = async goods => {
    if (goods.sku.length > 1) {
      // 调出 选择规格组件
      this.setState({ curGoods: goods, openSku: true });
    } else {
      const orderRes = await this.props.dispatch({
        type: 'cart/OrderSubmitShop',
        payload: {
          productId: goods.sku[0].id,
          goodsId: goods.id,
          distributorId: this.state.fromUserId,
        },
      });
      if (!orderRes.id) return;
      if (orderRes.errno === 401) {
        Taro.navigateTo({ url: '/pages/login/index?back=back' });
        return;
      }

      const payParam = await this.props.dispatch({
        type: 'cart/Prepay',
        payload: {
          orderId: orderRes.id,
        },
      });
      const res = await Taro.requestPayment({
        timeStamp: payParam.timeStamp,
        nonceStr: payParam.nonceStr,
        package: payParam.package,
        signType: payParam.signType,
        paySign: payParam.paySign,
        success: res => {
          if (res.errMsg === 'requestPayment:fail cancel') {
            this.props.dispatch({
              type: 'order/Cancel',
              payload: {
                orderId: orderRes.id,
              },
            });
            tip('支付失败，请重新下单支付');
          } else {
            Taro.redirectTo({
              url: `/pages/order/purchasedShop?orderId=${orderRes.id}&type=ok`,
            });
          }
        },
        fail: () => {
          this.props.dispatch({
            type: 'order/Cancel',
            payload: {
              orderId: orderRes.id,
            },
          });
        },
      });
    }
  };
  handleCloseSku = () => {
    this.setState({ openSku: false });
  };
  handleChangeSku = async payload => {
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

  lookBig = (img, no?) => {
    const bigImg = no ? img : img + '@!q90';
    Taro.previewImage({
      current: bigImg,
      urls: [bigImg],
    });
  };

  lookBigM = (img, imgList) => {
    console.log(img);
    const list = imgList.map(ele => ele + '@!q90');
    Taro.previewImage({
      current: img + '@!q90',
      urls: list,
    });
  };

  nextTab(url) {
    Taro.switchTab({ url });
  }

  shareBtn = async () => {
    if (!Taro.getStorageSync('token')) {
      Taro.navigateTo({ url: '/pages/login/index?back=back' });
      return;
    }
    this.setState({
      shareStart: !this.state.shareStart,
    });
  };

  onOpenSetting() {
    this.setState({ checkSave: true }, () => {
      this.saveImage();
    });
  }

  async saveImage() {
    this.setState({
      shareImgStart: true,
    });
    if (!this.state.shareImage) {
      const now = new Date();
      const nowStr = `${now.getMonth() + 1}/${now.getDate()}`;

      let ewm = `${baseUrl}/index/getWXACodeUnlimit?id=${this.state.id}&n=${nowStr}&p=${
        this.state.shopPlanId
      }&c=${this.props.userInfo.communityId}&page=pages/goods/index&width=280px`;
      if (this.state.hasNum) {
        ewm = `${baseUrl}/index/getWXACodeUnlimit?id=${this.state.id}&n=${nowStr}&f=${
          this.props.userInfo.id
        }&p=${this.state.shopPlanId}&c=${
          this.props.userInfo.communityId
        }&page=pages/goods/index&width=280px`;
      }
      this.setState({ goodsShare: goodsShare(this.props.userInfo, this.props.Detail.info, ewm) });
      return;
    }
    // if (!this.state.shareImage) return;
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

  async shareFriend(bigImg) {
    await Taro.previewImage({
      current: bigImg,
      urls: [bigImg],
    });
  }

  closeShare() {
    this.setState({
      shareStart: false,
      shareImgStart: false,
    });
  }

  eventGetImage(event) {
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
    shareImgStart: false,
    checkSave: true,
    id: null,
    shopPlanId: null,
    fromUserId: null,
    hasNum: 0,
  };

  render() {
    const {
      openSku,
      curGoods,
      countdown,
      goodsShare,
      shareImage,
      shareStart,
      shareImgStart,
      checkSave,
      goodsNumber,
      disabled,
      shopPlanId,
      productList,
      hasNum,
    }: any = this.state;
    const { Detail, cartTotal, userInfo } = this.props;
    if (!Detail.info)
      return <AtActivityIndicator className="center" mode="center" color="#f1836f" />;

    const { info, selledUsers, issueList, recommendList } = Detail;
    if (!info) return null;
    let imgList = [];
    if (info) imgList = info.list_pic_url.split(',');

    // 秒杀

    // 预售
    let current = 0;
    if (getTime(info.over_time) > getTime()) current = 1;
    if (getTime(info.over_time) < getTime()) current = 2;
    const formate = date => {
      if (!date) return '';
      return date.substr(5, 5);
    };

    const type3 = {
      items: [
        { title: formate(info.start_time) + '开始', icon: { value: 'clock' } },
        { title: formate(info.over_time) + '截止下单', icon: { value: 'shopping-bag-2' } },
        shopPlanId
          ? { title: formate(info.predict_time) + '结束使用', icon: { value: 'lightning-bolt' } }
          : { title: formate(info.predict_time) + '预计配送', icon: { value: 'lightning-bolt' } },
      ],
      current,
    };

    const detailNodes = '<div class="detail-wrap">' + info.goods_desc + '</div>';
    return (
      <View className="goods-page">
        <Login show={false} onChange={this.loginSuccess} />

        {/* <ChangeCommunity show={false} /> */}

        {shareImgStart && (
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
          </View>
        )}

        {shareStart && (
          <View>
            <Form reportSubmit onSubmit={this.getFormId}>
              <View className="share-bottom">
                <View className="close erduufont ed-close" onClick={this.shareBtn} />
                {info.sku[0].distributeMoney && (
                  <View>
                    <View className="p-text">
                      好东西就要分享给朋友，通过您的链接下单后， 您即可获得分成
                      <Text className="active">￥{info.sku[0].distributeMoney}</Text>
                      ，且不限次数。
                    </View>
                    {!hasNum && (
                      <View className="p-text">注：您必须先自己购买成功才能获得推荐分成！</View>
                    )}
                  </View>
                )}
                <View className="share-bottom-in">
                  {!shareImgStart ? (
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
                  ) : (
                    <Button
                      className="share-item"
                      plain={true}
                      formType="submit"
                      onClick={this.lookBig.bind(this, shareImage)}
                    >
                      <Text className="erduufont ed-weixin" />
                      点击出现大图，长按分享群或好友
                    </Button>
                  )}
                  {checkSave ? (
                    <Button
                      className="share-item"
                      plain={true}
                      formType="submit"
                      onClick={this.saveImage}
                    >
                      <Text className="erduufont ed-xiazai" />
                      {shareImage ? '保存图片' : '生成图片分享'}
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
              </View>
            </Form>
          </View>
        )}
        <canvasdrawer painting={goodsShare} ongetImage={this.eventGetImage} />
        <Button className="share-btn plain" plain onClick={this.shareBtn}>
          <Text className="erduufont ed-share" />
          分享
        </Button>

        <View className="swiper-wrap">
          {info.goods_type > 1 && !shopPlanId ? (
            <View className="goods-type-wrap">
              <View className="ribbon" />
              <View className="ribbon-text">{info.goods_type === 2 ? '秒杀' : '预售'}</View>
            </View>
          ) : null}
          {!goodsNumber && (
            <View className="soldover">
              <View className="erduufont ed-qiangguangliao" />
            </View>
          )}
          <Swiper className="swiper" indicatorDots indicatorActiveColor="#f1836f" autoplay>
            {imgList.map((ele, i) => (
              <SwiperItem key={i}>
                <Image
                  onClick={this.lookBigM.bind(this, ele, imgList)}
                  className="image"
                  src={ele + '@!750X500'}
                />
              </SwiperItem>
            ))}
          </Swiper>
          {info.goods_type >= 2 ? (
            <View className="miaosha-wrap">
              <View className="trapezoid" />
              {getTime(info.start_time) > getTime() ? (
                <View className="miaosha">
                  马上开始
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
                <View>
                  {getTime(info.over_time) > getTime() ? (
                    <View>
                      {countdown.time ? (
                        <View className="miaosha">
                          {shopPlanId ? '限时抢购' : '马上结束'}
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
            <View className="retail">{shopPlanId ? '抢购价' : '团购价'}</View>
            <View className="vip">
              ￥{info.sku[0].retail_price.toFixed(1)}
              <View className="counter">￥{info.sku[0].counter_price.toFixed(1)}</View>
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
          {info.is_limited && (
            <View className="desc">
              <AtTag active={true} size="small">
                限购{info.is_limited}
                {info.goods_unit}
              </AtTag>
            </View>
          )}
          {shopPlanId && (
            <View className="desc">
              <AtTag active={true} size="small">
                不支持退款
              </AtTag>
            </View>
          )}
          <View className="sale-wrap">
            <View
              className="sale-slide"
              style={{ width: (goodsNumber / (info.sell_volume + goodsNumber)) * 100 + '%' }}
            />
            {!!goodsNumber ? `仅剩${goodsNumber}${info.goods_unit}` : '已售罄'}
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
        {!shopPlanId && recommendList && recommendList.length && (
          <View className="wrap reco-wrap">
            <View className="h3">推荐商品</View>
            <ScrollView scrollX={true}>
              <View className="scroll-view-wrap">
                {recommendList.map(ele => (
                  <GoodsItem key={ele.id} type="mini" goods={ele} onChange={this.addCartOk} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        {shopPlanId && (
          <View className="wrap mt-wrap">
            <View className="h3">可用项目</View>
            {productList.map(ele => (
              <Product key={ele.id} item={ele} />
            ))}
          </View>
        )}
        <View className="wrap rich-wrap">
          <View className="h3">{shopPlanId ? '项目' : '商品'}详情</View>
          <RichText nodes={detailNodes} onClick={this.clickDetail.bind(this)} />

          {!shopPlanId && (
            <View>
              <View className="h3">发货须知</View>
              <View className="p">
                <View>当天团购结束后，次日下午送达小区长代收点；</View>
                <View>如标明预售则按预售日期发货配送。</View>
              </View>
            </View>
          )}

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
        {shopPlanId ? (
          <View className="bottom">
            <Button
              className="zhuye-wrap plain"
              plain
              onClick={this.nextTab.bind(this, '/pages/index/index')}
            >
              <Text className="erduufont ed-zhuye1" />
              <View className="bottom-text">首页</View>
            </Button>
            <Button className="cart-wrap plain" plain onClick={this.shareBtn}>
              {/* <View className="badge">{cartTotal.checkedGoodsCount || 0}</View> */}
              <Text className="erduufont ed-share" />
              <View className="bottom-text">
                分享赚<Text className="active">￥{info.sku[0].distributeMoney}</Text>
              </View>
            </Button>
            <View className="add-cart">
              <AtButton
                type="primary"
                disabled={!!disabled}
                onClick={this.submitShop.bind(this, info)}
              >
                {disabled || '立即抢购'}
              </AtButton>
            </View>
          </View>
        ) : (
          <View className="bottom">
            <Button
              className="zhuye-wrap plain"
              plain
              onClick={this.nextTab.bind(this, '/pages/index/index')}
            >
              <Text className="erduufont ed-zhuye1" />
              <View className="bottom-text">首页</View>
            </Button>
            <Button
              className="cart-wrap plain"
              plain
              onClick={this.nextTab.bind(this, '/pages/cart/index')}
            >
              <View className="badge">{cartTotal.checkedGoodsCount || 0}</View>
              <Text className="erduufont ed-gouwuche" />
              <View className="bottom-text">去结算</View>
            </Button>
            <View className="add-cart">
              <AtButton
                type="primary"
                disabled={!!disabled}
                onClick={this.addCartOk.bind(this, info)}
              >
                {disabled || '加入购物车'}
              </AtButton>
            </View>
          </View>
        )}
        {openSku ? (
          <Sku goods={curGoods} onChange={this.handleChangeSku} onClose={this.handleCloseSku} />
        ) : null}
      </View>
    );
  }
}
export default Goods as ComponentClass<PageOwnProps, PageState>;
