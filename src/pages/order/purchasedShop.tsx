import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './purchased.scss';
import { AtButton, AtActivityIndicator } from 'taro-ui';
import { goodsShare } from '../../config/goodsShare';
import { tip, Countdown, getTime } from '../../utils/tool';
import { baseUrl } from '../../config/index';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {
  userInfo: any;
  colonelInfo: any;
};

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ order, common, goods }) => ({
  ...order,
  ...common,
  ...goods
}))
export default class purchasedShop extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '支付结果',
    usingComponents: {
      canvasdrawer: '../../components/canvasdrawer/canvasdrawer'
    }
  };

  async componentDidMount() {
    const orderId = this.$router.params.orderId;
    const Detail = await this.props.dispatch({
      type: 'order/goodsDetail',
      payload: {
        orderId
      }
    });

    this.setState({ Detail, orderId });
    Taro.showShareMenu();
  }
  componentWillUnmount() {}

  async onPullDownRefresh() {
    Taro.stopPullDownRefresh();
  }

  nextPage(url) {
    Taro.navigateTo({ url });
  }
  nextTab = (url, goto) => {
    if (goto) {
      Taro.setStorageSync(goto, true);
    }
    Taro.switchTab({ url });
  };

  onShareAppMessage() {
    let { Detail }: any = this.state;
    const { userInfo } = this.props;

    return {
      title: `全城吃喝玩乐嗨通通免费，我是「${userInfo.nickName}」，邀你一起来狂欢`,
      path: `/pages/goods/index?id=${Detail.goods_id}&f=${userInfo.id}&c=${userInfo.communityId}&p=${Detail.shopPlanId}`,
      imageUrl: Detail.goodsInfo.share_img
    };
  }

  shareBtn = async () => {
    this.setState({
      shareStart: !this.state.shareStart
    });
  };

  onOpenSetting() {
    this.setState({ checkSave: true }, () => {
      this.saveImage();
    });
  }

  async saveImage() {
    const { Detail, shareImage }: any = this.state;
    const { userInfo }: any = this.props;
    this.setState({
      shareImgStart: true
    });

    Detail.goodsInfo.sku = [
      {
        retail_price: Detail.actual_price,
        counter_price: Detail.goods_price
      }
    ];

    if (!shareImage) {
      const ewm = `${baseUrl}/index/getWXACodeUnlimit?id=${Detail.id}&f=${userInfo.id}&p=${Detail.shopPlanId}&c=${userInfo.communityId}&page=pages/goods/index&width=280px`;
      this.setState({ goodsShare: goodsShare(userInfo, Detail.goodsInfo, ewm) });
      return;
    }
    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: shareImage || ''
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
      shareImgStart: false
    });
  }

  eventGetImage(event) {
    const { tempFilePath, errMsg } = event.detail;
    Taro.hideLoading();
    if (errMsg === 'canvasdrawer:ok') {
      this.setState({
        shareImage: tempFilePath
      });
    }
  }
  lookBig = (img, no?) => {
    const bigImg = no ? img : img + '@!q90';
    Taro.previewImage({
      current: bigImg,
      urls: [bigImg]
    });
  };

  state = {
    Detail: null,
    orderId: null,
    shareImage: null,
    shareStart: false,
    shareImgStart: false,
    checkSave: true,
    goodsShare: {}
  };
  render() {
    const {} = this.props;
    const { Detail, shareStart, shareImgStart, shareImage, checkSave, goodsShare }: any = this.state;

    return (
      <View className="purchased-page">
        {shareImgStart && (
          <View>
            <View className="curtain" onClick={this.closeShare} />
            {shareImage ? (
              <Image className="shareImage" mode="widthFix" src={shareImage} onClick={this.lookBig.bind(this, shareImage)} />
            ) : (
              <AtActivityIndicator content="分享图生成中" className="center loading" size={80} mode="center" color="#fff" />
            )}
          </View>
        )}

        {shareStart && (
          <View>
            <View className="share-bottom">
              <View className="close erduufont ed-close" onClick={this.shareBtn} />
              {Detail.distributeMoney && (
                <View>
                  <View className="p-text">
                    好东西就要分享给朋友，通过您的链接下单后， 您即可获得分成
                    <Text className="active">￥{Detail.distributeMoney}</Text>
                    ，且不限次数。
                  </View>
                </View>
              )}
              <View className="share-bottom-in">
                {!shareImgStart ? (
                  <Button className="share-item" plain={true} open-type="share" onClick={this.closeShare}>
                    <Text className="erduufont ed-weixin" />
                    分享群或好友
                  </Button>
                ) : (
                  <Button className="share-item" plain={true} onClick={this.lookBig.bind(this, shareImage)}>
                    <Text className="erduufont ed-weixin" />
                    点击出现大图，长按分享群或好友
                  </Button>
                )}
                {checkSave ? (
                  <Button className="share-item" plain={true} formType="submit" onClick={this.saveImage}>
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
          </View>
        )}
        <canvasdrawer painting={goodsShare} ongetImage={this.eventGetImage} />

        <View className="result">
          <Text className="erduufont ed-dui green" />
          <View className="h4">恭喜，购买成功</View>
          <View className="bew">
            <View className="p">订单金额：{Detail.actual_price}元</View>
          </View>
          <View className="kh">
            <View className="text">
              您已加入全城狂欢队伍，分享并成功推荐购买后可以赚取佣金
              <Text className="active">￥{Detail.distributeMoney}</Text>，不限次数。
            </View>
            <Image lazyLoad mode="widthFix" className="img" src={Detail.goodsInfo.share_img + '@!q90'} />
          </View>

          <View className="pad40">
            <AtButton type="primary" onClick={this.shareBtn}>
              转发赚取佣金￥{Detail.distributeMoney}
            </AtButton>
            <View className="text">点击转发给好友或群，通过你的链接下单成功后，佣金立即到账</View>
          </View>
          <View className="op">
            <AtButton onClick={this.nextTab.bind(this, '/pages/ucenter/index', 'gotoOrder')}>查看订单</AtButton>
            <AtButton onClick={this.nextTab.bind(this, '/pages/ucenter/index', 'gotoCard')}>立即使用</AtButton>
          </View>
        </View>
      </View>
    );
  }
}
