import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Text, Button } from '@tarojs/components';
import { AtSearchBar, AtTabs, AtTabsPane, AtDivider, AtToast } from 'taro-ui';
import communityImg from '../../static/images/community.png';
import Login from '../../components/login/loginComponent';
import GoodsItem from '../../components/goods/goodsComponent';
import Sku from '../../components/sku/skuComponent';
import './index.scss';
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
  cateTopList: any[];
  List: any;
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
  // config: Config = {
  //   navigationBarTitleText: '新邻居',
  //   navigationBarBackgroundColor: '#fff',
  //   navigationBarTextStyle: 'white',
  //   backgroundTextStyle: 'dark',
  // }

  async componentDidMount() {
    console.log(this.$router.params, 'this.$router.params- -- componentDidMount');
    await this.props.dispatch({
      type: 'goods/getCateTop',
    });

    const cate = this.props.cateTopList[0];
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: 'cate0',
        parent_id: cate.id,
        promot_cate_id: cate.type === 0 ? cate.id : null,
      },
    });
  }

  async onPullDownRefresh() {
    const value = this.state.current;
    const cate = this.props.cateTopList[value];
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: `cate${value}`,
        parent_id: cate.id,
        promot_cate_id: cate.type === 0 ? cate.id : null,
        refresh: true,
        loadOver: false,
      },
    });
    Taro.stopPullDownRefresh();
  }

  nextPage(url) {
    Taro.navigateTo({ url });
  }

  openLoginModal() {
    Taro.login();
    this.setState({
      openLogin: true,
    });
  }

  loginSuccess() {
    // 更新状态
  }
  async handleClick(value) {
    const cate = this.props.cateTopList[value];
    await this.props.dispatch({
      type: 'goods/List',
      payload: {
        listName: `cate${value}`,
        parent_id: cate.id,
        promot_cate_id: cate.type === 0 ? cate.id : null,
      },
    });
    this.setState({
      current: value,
    });
    console.log(this.props.List);
  }

  handNull = () => {};
  clearToast = () => {
    this.setState({ addCartTip: false });
  };

  addCartOk = async goods => {
    if (goods.sku.length > 1) {
      // 调出 选择规格组件
      this.setState({ curGoods: goods, openSku: true });
    } else {
      await this.props.dispatch({
        type: 'cart/add',
        payload: {
          productId: goods.sku[0].id,
          goodsId: goods.id,
        },
      });
      this.setState({ addCartTip: true });
    }
  };
  handleCloseSku = () => {
    this.setState({ openSku: false });
  };
  handleChangeSku = async payload => {
    console.log('handleSkuOk', payload);
    // 加入购物车
    await this.props.dispatch({
      type: 'cart/add',
      payload,
    });
    this.setState({ addCartTip: true });
  };

  state = {
    openLogin: false,
    current: 0,
    addCartTip: false,
    openSku: false,
    curGoods: {},
  };

  render() {
    const { cateTopList, List } = this.props;
    const { openLogin, current, addCartTip, openSku, curGoods } = this.state;
    const tabList = cateTopList.map(ele => {
      return { title: ele.name };
    });

    return (
      <View className="index wrap">
        <Login show={openLogin} onChange={this.loginSuccess} />
        <AtToast
          isOpened={addCartTip}
          text="已添加到购物车"
          duration={1000}
          onClose={this.clearToast}
        />
        <View className="index-top">
          <View className="community-wrap">
            <Image src={communityImg} />
            景江花园
            <Text className="erduufont ed-back go" />
          </View>
        </View>
        <View className="search-wrap">
          <AtSearchBar value="" onChange={this.handNull} />
        </View>

        <AtTabs
          className="tabs"
          current={current}
          swipeable={false}
          scroll={true}
          tabList={tabList}
          onClick={this.handleClick}
        >
          {tabList.map((tab, i) => (
            <AtTabsPane key={i} current={this.state.current} index={i}>
              {List[`cate${i}`]
                ? List[`cate${i}`].list.map(ele => (
                    <View key={ele.id} style={{ display: current === i ? 'flex' : 'none' }}>
                      <GoodsItem goods={ele} onChange={this.addCartOk} />
                    </View>
                  ))
                : null}

              {List[`cate${i}`] && List[`cate${i}`].list.length && List[`cate${i}`].loadOver ? (
                <AtDivider content="没有更多了" fontSize="26" fontColor="#ccc" lineColor="#eee" />
              ) : null}
              {!(List[`cate${i}`] && List[`cate${i}`].list.length) ? (
                <View className="nodata">
                  <Text className="erduufont ed-zanwushangpin" />
                  <View className="label">暂无商品</View>
                </View>
              ) : null}
            </AtTabsPane>
          ))}
        </AtTabs>
        {openSku ? (
          <Sku goods={curGoods} onChange={this.handleChangeSku} onClose={this.handleCloseSku} />
        ) : null}
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
