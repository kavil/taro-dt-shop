import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Text, ScrollView, Button, Swiper, SwiperItem, Form } from '@tarojs/components';
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
  AtAvatar
} from 'taro-ui';
import Login from '../../components/login/loginComponent';
import GoodsItem from '../../components/goods/goodsComponent';
import Sku from '../../components/sku/skuComponent';
// import ChangeCommunity from '../../components/changeCommunity/changeCommunity';
import './index.scss';
import { tip, Countdown, getTime, getLocalTime } from '../../utils/tool';
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
  mspTime: any;
  formIdArr: any[];
}

interface PageOwnProps {
  //父组件要传
}

interface PageStateProps {
  // 自己要用的
  userInfoLoading: boolean;
  loginLoading: boolean;
  endTime: any;
  title: any;
}

type IProps = PageStateProps & PageDva & PageOwnProps & PageState;

@connect(({ common, goods }) => ({
  ...common,
  ...goods
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
    navigationBarTitleText: '寻味知途·社区团购'
    // navigationBarBackgroundColor: '#fff',
    // navigationBarTextStyle: 'white',
    // backgroundTextStyle: 'dark',
  };

  onShareAppMessage() {
    const { userInfo } = this.props;
    console.log(`/pages/index/index?communityId=${userInfo.communityId}`);

    return {
      title: `【${userInfo.name}】今日开团链接`,
      path: `/pages/index/index?communityId=${userInfo.communityId}`
    };
  }
  async componentDidMount() {
    if (!Taro.getStorageSync('token')) {
      Taro.redirectTo({ url: '/pages/login/index' });
      return;
    }
    // if (!this.props.userInfo.colonelId) {
    //   Taro.redirectTo({ url: '/pages/neighbor/search?mode=redirect' });
    //   return;
    // }
    setTimeout(() => {
      this.setState({
        addmyappTip: true
      });
    }, 5 * 1000);
    Taro.showShareMenu();
    console.log(this.$router.params, 'this.$router.params- -- componentDidMount');
    this.props
      .dispatch({
        // A D
        type: 'common/spread'
      })
      .then((adRes) => {
        this.setState({
          indexAd: adRes.filter((ele) => ele.ad_position_id === 1)
        });
        const curtainRes = adRes.find((ele) => ele.ad_position_id === 3);
        if (curtainRes && Taro.getStorageSync('index-curtain') !== curtainRes.image_url) {
          this.setState({ curtainRes, curtainOpened: true, curtainPng: curtainRes.image_url });
        }
      });

    await this.props.dispatch({
      type: 'goods/getCate'
    });
    const cateTopList: any = [];
    const cateImgList: any = [];
    if (!this.props.cateList) {
      this.setState({ inited: true, cateTopList, indexAd: [] });
      return;
    }
    this.props.cateList.forEach((ele: any) => {
      if (ele.parent_id === 0) cateTopList.push(ele);
      cateImgList[ele.id] = ele.banner_url;
    });

    if (this.props.endTime) {
      setTimeout(() => {
        this.setState({
          countdownPlan: Countdown(this.props.endTime)
        });
      }, 1000);
    }
    this.setState({ cateTopList, cateImgList });
    this.msFunction();
    const cate = this.props.cateList[0];
    if (!cate) {
      this.setState({ inited: false });
      return;
    }
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: 'cate0',
        parent_id: cate.id,
        promot_cate_id: cate.type === 2 ? cate.id : null
      }
    });
    this.setState({ inited: true });
  }

  async msFunction() {
    const msList = await this.props.dispatch({
      type: 'goods/MsList',
      payload: {
        goods_type: 2
      }
    });
    if (msList.data.length) {
      const mstItem: any = this.whatTime(this.props.mspTime);
      if (!mstItem) {
        this.setState({
          mstItem
        });
        return;
      }
      const ele: any = this.props.mspTime[mstItem.i];
      const nowPre = this.nowPre() + ele.start;
      let msTime = '';

      let msText = '距开始';
      if (getTime() < getTime(this.nowPre() + this.props.mspTime[this.props.mspTime.length - 1].end)) {
        if (mstItem.before) {
          msTime = getLocalTime(nowPre);
        } else {
          msText = '距结束';
          msTime = getLocalTime(this.nowPre() + ele.end);
        }
        this.setState({
          countdown: Countdown(msTime),
          msTime,
          msText,
          mstItem
        });
      }
    }
  }

  nowPre = () => {
    const now = new Date();
    return now.getFullYear().toString() + '/' + (now.getMonth() + 1).toString() + '/' + now.getDate().toString() + ' ';
  };

  whatTime = (msTime) => {
    const now = getTime();
    for (let i = 0; i < msTime.length; i++) {
      const mst = msTime[i];
      if (now < getTime(this.nowPre() + mst.start)) return { i, before: true };
      if (now < getTime(this.nowPre() + mst.end)) return { i, before: false };
    }
    return null;
  };

  avoid = false;
  onTimeUp = async () => {
    if (this.avoid) return;
    this.avoid = true;
    await this.msFunction();
    this.avoid = false;
  };
  onTimeUpPlan = async () => {
    // if (this.avoid) return;
    // this.avoid = true;
    // setTimeout(async () => {
    //   console.log(1111);
    //   await Taro.reLaunch({ url: '/pages/index/index' });
    //   this.avoid = false;
    // }, 1000);
  };
  async onPullDownRefresh() {
    await this.componentDidMount();
    const value = this.state.current;
    const { cateTopList }: any = this.state;

    if (this.props.cateList) {
      const cate = this.props.cateList.find((ele) => ele.name === cateTopList[value].name);
      await this.props.dispatch({
        type: 'goods/List',
        payload: {
          listName: `cate${value}`,
          parent_id: cate.id,
          promot_cate_id: cate.type === 2 ? cate.id : null,
          refresh: true,
          loadOver: false
        }
      });
    }
    Taro.stopPullDownRefresh();
  }

  async onReachBottom() {
    const value = this.state.current;
    const { cateTopList }: any = this.state;

    const cate = this.props.cateList.find((ele) => ele.name === cateTopList[value].name);
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: `cate${value}`,
        parent_id: cate.id,
        promot_cate_id: cate.type === 2 ? cate.id : null
      }
    });
  }

  nextPage(url, noOpen?) {
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
      current: value
    });
    setTimeout(() => {
      Taro.pageScrollTo({
        scrollTop: 0,
        duration: 0
      });
    }, 100);
    const { cateTopList }: any = this.state;
    const cate = this.props.cateList.find((ele) => ele.name === cateTopList[value].name);

    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: `cate${value}`,
        parent_id: cate.id,
        promot_cate_id: cate.type === 2 ? cate.id : null,
        goods_type: cate.name === '预售' ? 3 : null
      }
    });
  }

  handNull = () => {};

  addCartOk = async (goods) => {
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
          goodsId: goods.id
        }
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
  handleChangeSku = async (payload) => {
    if (!payload) {
      setTimeout(() => {
        Taro.login(); // 经验 先获取到code 不容易失效
        Taro.eventCenter.trigger('login', true);
      }, 100);
      return;
    }
    // 加入购物车
    const res = await this.props.dispatch({
      type: 'cart/Add',
      payload
    });
    if (res) {
      setTimeout(() => {
        tip('已添加到购物车');
      }, 90);
    }
  };

  newDate = (date) => {
    if (!date) return 0;
    return new Date(date.replace(/-/g, '/'));
  };

  onCloseOpen = () => {
    this.setState({ noCommunityOpen: false, colonelOpen: false });
  };

  makeCall = (phoneNumber) => {
    Taro.makePhoneCall({ phoneNumber });
  };

  openColonel = () => {
    this.setState({ colonelOpen: true });
  };
  lookBig = (img) => {
    Taro.previewImage({
      current: img + '@!q90',
      urls: [img + '@!q90']
    });
  };
  viewGoods = (ele) => {
    if (ele.linkto) this.nextPage('/pages/goods/index?id=' + ele.linkto);
  };
  getFormId = (e) => {
    const formId = e.detail.formId;
    const formIdArr = [...this.props.formIdArr];
    formIdArr.push({ formId, createdTime: Math.floor(new Date().getTime() / 1000) });
    console.log(formIdArr, '<---------------------formIdArr');
    this.props.dispatch({
      type: 'common/save',
      payload: {
        formIdArr
      }
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
    indexAd: [],
    noCommunityOpen: false,
    colonelOpen: false,
    inited: undefined
  };

  render() {
    const { List, userInfo, MsList, title, mspTime } = this.props;
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
      msText,
      mstItem,
      indexAd,
      noCommunityOpen,
      colonelOpen,
      inited,
      countdownPlan
    }: any = this.state;

    const tabList = cateTopList.map((ele) => {
      return { title: ele.name };
    });
    const getCateImg = (cate_id, j, list) => {
      const index = j - 1;
      if (index < 0) return cateImgList[cate_id];
      if (list[index].category_id === cate_id) return false;
      return cateImgList[cate_id];
    };

    const getIndexAdClass = () => {
      if (indexAd[0].linkto.includes('303')) return 'index-ad big';
      return 'index-ad';
    };

    return (
      <View className="index wrap">
        <AtModal isOpened={noCommunityOpen}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>本小区暂无小区长，请选择绑定附近小区作为代收点。</AtModalContent>
          <AtModalAction>
            <Button type="primary" onClick={this.nextPage.bind(this, '/pages/neighbor/search', 'noOpen')}>
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
            <View className="p">您购买的物品将统一配送至小区长代收点，由小区长负责您的售后。联系小区长进小区群，享受更多服务。</View>
            {userInfo.colonelInfo.house && <View className="p">收货点：{userInfo.colonelInfo.house}</View>}
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
            <Button onClick={this.nextPage.bind(this, '/pages/neighbor/search', 'noOpen')}>切换附近小区</Button>
          </AtModalAction>
        </AtModal>
        <Login show={false} onChange={this.loginSuccess} />

        {/* <ChangeCommunity show={false} /> */}

        <AtCurtain isOpened={curtainOpened} onClose={this.onCloseCurtain.bind(this)}>
          {curtainPng && (
            <View onClick={this.viewGoods.bind(this, this.state.curtainRes)}>
              <Image className="curtain-img" src={curtainPng + '@!640X800'} />
            </View>
          )}
        </AtCurtain>
        {!addmyappTip && (
          <View className="addmyapp">
            <View className="arr" />
            添加到我的小程序，抢购更方便
          </View>
        )}

        {userInfo.isColonel && tabList.length && (
          <Form reportSubmit onSubmit={this.getFormId}>
            <Button className="share-btn plain" formType="submit" open-type="share" plain>
              <Text className="erduufont ed-share" />
              分享今日团购链接
            </Button>
          </Form>
        )}

        <View className="index-top">
          {userInfo.colonelId ? (
            <View className="colonel-div" onClick={this.openColonel}>
              <View className="colonel-wrap">
                <View className="badge">小区长</View>
                <View className="colonel">
                  <AtAvatar circle size="normal" image={userInfo.colonelInfo.avatarUrl} />
                </View>
              </View>
              <View className="colonel-info">
                <View className="name ddd">{userInfo.colonelInfo.nickName}</View>
                <View className="p ddd">{userInfo.name}</View>
                {userInfo.colonelInfo.house && <View className="p ddd">提货位置:{userInfo.colonelInfo.house}</View>}
              </View>
            </View>
          ) : (
            <View className="colonel-div" onClick={this.nextPage.bind(this, '/pages/neighbor/search', 'noOpen')}>
              点击绑定小区团购
            </View>
          )}
          <View className="search-wrap">
            <AtSearchBar value="" onChange={this.handNull} />
            <View className="search-mask" onClick={this.nextPage.bind(this, '/pages/index/search')} />
            {title ? (
              <View className="timedown">
                <Text className="b">{title}</Text>·距结束
                <View className="td-wrap">
                  <AtCountdown
                    format={{ day: '天', hours: ':', minutes: ':', seconds: '' }}
                    isShowDay={countdownPlan.isShowDay}
                    day={countdownPlan.day}
                    hours={countdownPlan.time[0]}
                    minutes={countdownPlan.time[1]}
                    seconds={countdownPlan.time[2]}
                    onTimeUp={this.onTimeUpPlan.bind(this)}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {inited !== undefined && !tabList.length && !List[`cate0`] ? (
          <View>
            <View className="center" style={{ top: '30%' }}>
              本期团购已结束
              <View className="p">开团时间00:00 ~ 23:00</View>
            </View>
            <AtButton className="center" type="primary" onClick={this.componentDidMount}>
              重新加载
            </AtButton>
          </View>
        ) : null}

        <AtTabs className="tabs" current={current} swipeable={false} scroll={true} tabList={tabList} onClick={this.handleClick}>
          {tabList.map((_, i) => (
            <AtTabsPane key={i} current={current} index={i}>
              {current === 0 && indexAd.length && (
                <View className={getIndexAdClass()}>
                  <Swiper className="swiper" indicatorDots indicatorActiveColor="#f1836f" autoplay>
                    {indexAd.map((ele, i) => (
                      <SwiperItem key={i} onClick={this.viewGoods.bind(this, ele)}>
                        <Image
                          mode="widthFix"
                          className="img"
                          src={ele.image_url + (getIndexAdClass() === 'index-ad big' ? '@!710X900' : '@!900X383')}
                        />
                      </SwiperItem>
                    ))}
                  </Swiper>
                </View>
              )}
              {current === 0 && MsList && MsList.length && (
                <View className="ms-wrap">
                  <View className="ms-top">
                    <View className="flex-item">
                      <Text className="type-tag erduufont ed-ms" />
                      <View className="ms-cd">
                        {msTime ? (
                          <View className="ms-text">
                            <View className="ms-cd-item">{msText}</View>
                            <AtCountdown
                              format={{ day: '天', hours: ':', minutes: ':', seconds: '' }}
                              isShowDay={countdown.isShowDay}
                              day={countdown.day}
                              hours={countdown.time[0]}
                              minutes={countdown.time[1]}
                              seconds={countdown.time[2]}
                              onTimeUp={this.onTimeUp.bind(this, msTime)}
                            />
                          </View>
                        ) : (
                          <View className="ms-cd-item">已结束</View>
                        )}
                      </View>
                    </View>
                    <View className="time-area">
                      {mspTime.map((ele, i) => (
                        <View key={i} className={mstItem.i == i ? 'time-item active' : 'time-item'}>
                          {ele.start}
                          {!mstItem ? (
                            <View className="p">已结束</View>
                          ) : (
                            <View className="p">
                              {mstItem.i > i ? '已结束' : mstItem.i == i && !mstItem.before ? '抢购中' : '即将开始'}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                  <ScrollView scrollX={true}>
                    <View className="scroll-view-wrap">
                      {MsList.map((ele) => (
                        <GoodsItem key={ele.id} type="mini" goods={ele} onChange={this.addCartOk} />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              <View>
                {List[`cate${i}`]
                  ? List[`cate${i}`].list.map((ele, j) => (
                      <View className="item-wrap" key={ele.id} style={{ display: current === i ? 'block' : 'none' }}>
                        {getCateImg(ele.category_id, j, List[`cate${i}`].list) ? (
                          <View className="cate-img">
                            <Image
                              lazyLoad
                              mode="widthFix"
                              className="img"
                              src={getCateImg(ele.category_id, j, List[`cate${i}`].list) + '@!900X200'}
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
        {openSku && <Sku goods={curGoods} onChange={this.handleChangeSku} onClose={this.handleCloseSku} />}
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
