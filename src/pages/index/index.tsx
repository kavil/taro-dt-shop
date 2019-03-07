import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Text } from '@tarojs/components';
import { AtSearchBar, AtTabs, AtTabsPane, AtDivider, AtCurtain } from 'taro-ui';
import communityImg from '../../static/images/community.png';
import Login from '../../components/login/loginComponent';
import GoodsItem from '../../components/goods/goodsComponent';
import Sku from '../../components/sku/skuComponent';
import './index.scss';
import { tip } from '../../utils/tool';
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
    }, 10 * 1000);
    Taro.showShareMenu({
      withShareTicket: true,
    });
    console.log(this.$router.params, 'this.$router.params- -- componentDidMount');
    const curtainRes = await this.props.dispatch({
      // A D
      type: 'common/spread',
    });
    if (Taro.getStorageSync('index-curtain') !== curtainRes.id) {
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

  async onPullDownRefresh() {
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

  nextPage(url) {
    Taro.navigateTo({ url });
  }

  onCloseCurtain = () => {
    this.setState({ curtainOpened: false });
    Taro.setStorageSync('index-curtain', this.state.curtainRes['id']);
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
        }, 100);
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
      tip('已添加到购物车');
    }
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
  };

  render() {
    const { List, userInfo } = this.props;
    const {
      current,
      openSku,
      curGoods,
      cateTopList,
      cateImgList,
      curtainOpened,
      curtainPng,
      addmyappTip,
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
        </View>
        <View className="search-wrap">
          <AtSearchBar value="" onChange={this.handNull} />
          <View className="search-mask" onClick={this.nextPage.bind(this, '/pages/index/search')} />
        </View>

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
