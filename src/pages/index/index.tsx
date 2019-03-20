import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Text, ScrollView, Button } from '@tarojs/components';
import {
  AtSearchBar,
  AtTabs,
  AtTabsPane,
  AtDivider,
  AtCurtain,
  AtCountdown,
  AtButton,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtAvatar,
} from 'taro-ui';
import communityImg from '../../static/images/community.png';
import Login from '../../components/login/loginComponent';
import GoodsItem from '../../components/goods/goodsComponent';
import Sku from '../../components/sku/skuComponent';
import './index.scss';
import { tip, Countdown } from '../../utils/tool';
// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageState = {};
interface PageDva {
  dispatch: Function;
  cateList: any[];
  List: any;
  MsList: any;
  userInfo: any;
}

interface PageOwnProps {
  //父组件要传
}

interface PageStateProps {
  // 自己要用的
  userInfoLoading: boolean;
  loginLoading: boolean;
}

type IProps = PageStateProps & PageDva & PageOwnProps & PageState;

@connect(({ common, goods }) => ({
  ...common,
  ...goods,
}))
class Index extends Component<IProps, {}> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '新邻居·社区团',
    // navigationBarBackgroundColor: '#fff',
    // navigationBarTextStyle: 'white',
    // backgroundTextStyle: 'dark',
  };

  async componentDidMount() {
    setTimeout(() => {
      this.setState({
        addmyappTip: true,
      });
    }, 6 * 1000);
    Taro.showShareMenu({
      withShareTicket: true,
    });
    console.log(this.$router.params, 'this.$router.params- -- componentDidMount');
    const adRes = await this.props.dispatch({
      // A D
      type: 'common/spread',
    });
    this.setState({
      indexAd: adRes.find(ele => ele.ad_position_id === 1),
    });
    const curtainRes = adRes.find(ele => ele.ad_position_id === 3);
    if (Taro.getStorageSync('index-curtain') !== curtainRes.image_url) {
      this.setState({ curtainRes, curtainOpened: true, curtainPng: curtainRes.image_url });
    }
    await this.props.dispatch({
      type: 'goods/getCate',
    });
    const cateTopList: any = [];
    const cateImgList: any = [];
    this.props.cateList.forEach((ele: any) => {
      if (ele.parent_id === 0) cateTopList.push(ele);
      cateImgList[ele.id] = ele.banner_url;
    });
    this.setState({ cateTopList, cateImgList });
    const msList = await this.props.dispatch({
      type: 'goods/MsList',
      payload: {
        goods_type: 2,
      },
    });
    if (msList.data.length) {
      const now = new Date();
      const msTime = new Date(
        now.getFullYear().toString() +
          '/' +
          (now.getMonth() + 1).toString() +
          '/' +
          now.getDate().toString() +
          ' 20:30'
      ).toLocaleString('zh', { hour12: false });
      this.setState({
        countdown: Countdown(msTime),
        msTime,
      });
    }
    const cate = this.props.cateList[0];
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: 'cate0',
        parent_id: cate.id,
        promot_cate_id: cate.type === 2 ? cate.id : null,
      },
    });
  }
  onTimeUp = () => {};
  async onPullDownRefresh() {
    if (!(this.props.cateList && this.props.cateList.length)) {
      this.componentDidMount();
    } else {
      const value = this.state.current;
      const { cateTopList }: any = this.state;

      const cate = this.props.cateList.find(ele => ele.name === cateTopList[value].name);
      await this.props.dispatch({
        type: 'goods/List',
        payload: {
          listName: `cate${value}`,
          parent_id: cate.id,
          promot_cate_id: cate.type === 2 ? cate.id : null,
          refresh: true,
          loadOver: false,
        },
      });
    }
    Taro.stopPullDownRefresh();
  }

  async onReachBottom() {
    const value = this.state.current;
    const { cateTopList }: any = this.state;

    const cate = this.props.cateList.find(ele => ele.name === cateTopList[value].name);
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: `cate${value}`,
        parent_id: cate.id,
        promot_cate_id: cate.type === 2 ? cate.id : null,
      },
    });
  }

  nextPage(url, noOpen) {
    if (noOpen) this.onCloseOpen();
    Taro.navigateTo({ url });
  }

  onCloseCurtain = () => {
    this.setState({ curtainOpened: false });
    Taro.setStorageSync('index-curtain', this.state.curtainRes['image_url']);
  };
  loginSuccess() {}
  nextTab(url) {
    Taro.switchTab({ url });
  }
  async handleClick(value) {
    this.setState({
      current: value,
    });
    setTimeout(() => {
      Taro.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });
    }, 100);
    const { cateTopList }: any = this.state;
    const cate = this.props.cateList.find(ele => ele.name === cateTopList[value].name);
    console.log(cate);

    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: `cate${value}`,
        parent_id: cate.id,
        promot_cate_id: cate.type === 2 ? cate.id : null,
        goods_type: cate.name === '预售' ? 3 : null,
      },
    });
  }

  handNull = () => {};

  addCartOk = async goods => {
    // console.log(this.props.userInfo);
    if (this.props.userInfo.id && !this.props.userInfo.colonelId) {
      this.setState({ noCommunityOpen: true });
      return;
    }

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
      if (res.errno === 401) {
        Taro.login(); // 经验 先获取到code 不容易失效
        Taro.eventCenter.trigger('login', true);
      }
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
    if (res) {
      setTimeout(() => {
        tip('已添加到购物车');
      }, 90);
    }
  };

  newDate = date => {
    if (!date) return 0;
    return new Date(date.replace(/-/g, '/'));
  };

  onCloseOpen = () => {
    this.setState({ noCommunityOpen: false, colonelOpen: false });
  };

  makeCall = phoneNumber => {
    Taro.makePhoneCall({ phoneNumber });
  };

  openColonel = () => {
    this.setState({ colonelOpen: true });
  };
  lookBig = img => {
    console.log(img);
    Taro.previewImage({
      current: img + '@!q90',
      urls: [img + '@!q90'],
    });
  };

  state = {
    current: 0,
    openSku: false,
    curGoods: {},
    cateTopList: [],
    curtainOpened: false,
    curtainPng: null,
    curtainRes: {},
    addmyappTip: false,
    countdown: {},
    msTime: null,
    indexAd: null,
    noCommunityOpen: false,
    colonelOpen: false,
  };

  render() {
    const { List, userInfo, MsList } = this.props;
    const {
      current,
      openSku,
      curGoods,
      cateTopList,
      cateImgList,
      curtainOpened,
      curtainPng,
      addmyappTip,
      countdown,
      msTime,
      indexAd,
      noCommunityOpen,
      colonelOpen,
    }: any = this.state;

    const tabList = cateTopList.map(ele => {
      return { title: ele.name };
    });
    const getCateImg = (cate_id, j, list) => {
      const index = j - 1;
      if (index < 0) return cateImgList[cate_id];
      if (list[index].category_id === cate_id) return false;
      return cateImgList[cate_id];
    };

    return (
      <View className="index wrap">
        <AtModal isOpened={noCommunityOpen}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>本小区暂无小区长，请选择绑定附近小区作为代收点。</AtModalContent>
          <AtModalAction>
            <Button
              type="primary"
              onClick={this.nextPage.bind(this, '/pages/neighbor/search', 'noOpen')}
            >
              去更换小区
            </Button>
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={colonelOpen}>
          <AtModalHeader>{userInfo.name}</AtModalHeader>
          <AtModalContent>
            <View className="colonel-wrap">
              <View className="colonel">
                <View className="badge">小区长</View>
                <AtAvatar circle size="small" image={userInfo.colonelInfo.avatarUrl} />
              </View>
              <View className="name">{userInfo.colonelInfo.nickName}</View>
            </View>
            <View className="p">
              您购买的物品将统一配送至小区长代收点，由小区长负责您的售后。联系小区长进小区群，享受更多服务。
            </View>
            {userInfo.colonelInfo.house && (
              <View className="p">收货点：{userInfo.colonelInfo.house}</View>
            )}
            {userInfo.colonelInfo.ewm && (
              <View className="colonel-ewm">
                <Image
                  lazyLoad
                  mode="widthFix"
                  className="img"
                  onClick={this.lookBig.bind(this, userInfo.colonelInfo.ewm)}
                  src={userInfo.colonelInfo.ewm + '@!300X300'}
                />
                <View className="p">小区长微信二维码，点击大图保存加好友</View>
              </View>
            )}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onCloseOpen}>关闭</Button>
            <Button type="primary" onClick={this.makeCall.bind(this, userInfo.colonelInfo.mobile)}>
              呼叫小区长
            </Button>
          </AtModalAction>
        </AtModal>
        <Login show={false} onChange={this.loginSuccess} />
        <AtCurtain isOpened={curtainOpened} onClose={this.onCloseCurtain.bind(this)}>
          {curtainPng && <Image className="curtain-img" src={curtainPng + '@!640X800'} />}
        </AtCurtain>
        {!addmyappTip && (
          <View className="addmyapp">
            <View className="arr" />
            好邻居添加到「我的小程序」
          </View>
        )}

        <View className="index-top">
          <View
            className="community-wrap"
            onClick={this.nextTab.bind(this, '/pages/neighbor/index')}
          >
            <Image src={communityImg} />
            {userInfo && userInfo.uid ? userInfo.name : '绑定小区享低价'}
            <Text className="erduufont ed-back go" />
          </View>
          {userInfo.colonelId && addmyappTip && (
            <View className="help" onClick={this.openColonel}>
              <View className="ava-wrap">
                <Image className="image" mode="scaleToFill" src={userInfo.colonelInfo.avatarUrl} />
              </View>
              <View className="text-wrap">小区长</View>
            </View>
          )}
        </View>
        <View className="search-wrap">
          <AtSearchBar value="" onChange={this.handNull} />
          <View className="search-mask" onClick={this.nextPage.bind(this, '/pages/index/search')} />
        </View>

        {!tabList.length && (
          <AtButton className="center" type="primary" onClick={this.componentDidMount}>
            重新加载
          </AtButton>
        )}

        <AtTabs
          className="tabs"
          current={current}
          swipeable={false}
          scroll={true}
          tabList={tabList}
          onClick={this.handleClick}
        >
          {tabList.map((_, i) => (
            <AtTabsPane key={i} current={current} index={i}>
              {current === 0 && indexAd && (
                <View className="index-ad">
                  <Image
                    lazyLoad
                    mode="widthFix"
                    className="img"
                    src={indexAd.image_url + '@!900X383'}
                  />
                </View>
              )}
              {current === 0 && MsList && MsList.length && (
                <View className="ms-wrap">
                  <View className="ms-top">
                    <Text className="type-tag erduufont ed-ms" />
                    <View className="ms-cd">
                      {this.newDate(msTime) >
                      this.newDate(new Date().toLocaleString('zh', { hour12: false })) ? (
                        <View className="ms-text">
                          <View className="ms-cd-item">仅剩</View>
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
                        <View className="ms-cd-item">已结束</View>
                      )}
                    </View>
                  </View>
                  <ScrollView scrollX={true}>
                    <View className="scroll-view-wrap">
                      {MsList.map(ele => (
                        <GoodsItem key={ele.id} type="mini" goods={ele} onChange={this.addCartOk} />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              <View>
                {List[`cate${i}`]
                  ? List[`cate${i}`].list.map((ele, j) => (
                      <View
                        className="item-wrap"
                        key={ele.id}
                        style={{ display: current === i ? 'block' : 'none' }}
                      >
                        {getCateImg(ele.category_id, j, List[`cate${i}`].list) ? (
                          <View className="cate-img">
                            <Image
                              lazyLoad
                              mode="widthFix"
                              className="img"
                              src={
                                getCateImg(ele.category_id, j, List[`cate${i}`].list) + '@!900X200'
                              }
                            />
                          </View>
                        ) : null}
                        <GoodsItem goods={ele} onChange={this.addCartOk} />
                      </View>
                    ))
                  : null}
              </View>

              {List[`cate${i}`] && List[`cate${i}`].list.length && List[`cate${i}`].loadOver ? (
                <AtDivider content="没有更多了" fontSize="26" fontColor="#ccc" lineColor="#eee" />
              ) : null}
              {!(List[`cate${i}`] && List[`cate${i}`].list.length) && List[`cate${i}`].loadOver ? (
                <View className="nodata">
                  <Text className="erduufont ed-zanwushangpin" />
                  <View className="label">暂无商品</View>
                </View>
              ) : null}
            </AtTabsPane>
          ))}
        </AtTabs>
        {openSku && (
          <Sku goods={curGoods} onChange={this.handleChangeSku} onClose={this.handleCloseSku} />
        )}
      </View>
    );
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>;
