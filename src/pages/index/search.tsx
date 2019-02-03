import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtSearchBar } from 'taro-ui';
import GoodsItem from '../../components/goods/goodsComponent';
import Sku from '../../components/sku/skuComponent';
import Login from '../../components/login/loginComponent';
import './index.scss';
import { tip } from '../../utils/tool';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  SearchList: any[];
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ common, goods }) => ({
  ...common,
  ...goods,
}))
class IndexSearch extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '新邻居·社区团',
  };

  async componentDidMount() {
    await this.props.dispatch({
      type: 'goods/SearchList',
    });
  }

  async onPullDownRefresh() {
    Taro.stopPullDownRefresh();
  }

  search = async value => {
    this.setState({ searchValue: value });
    if (this.timeCo) clearTimeout(this.timeCo);
    this.timeCo = setTimeout(async () => {
      await this.props.dispatch({
        type: 'goods/SearchList',
        payload: {
          name: value,
        },
      });
    }, 1500);
  };
  timeCo;

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
      if (res.errno === 0) this.setState({ addCartTip: true });
      if (res.errno === 401) {
        Taro.login(); // 经验 先获取到code 不容易失效
        Taro.eventCenter.trigger('login', true);
      }
    }
  };
  handleCloseSku = () => {
    this.setState({ openSku: false });
  };
  loginSuccess() {}
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
    searchValue: '',
    openSku: false,
    curGoods: {},
  };

  render() {
    const { SearchList } = this.props;
    const { searchValue, openSku, curGoods } = this.state;
    return (
      <View className="index-search">
        {openSku && (
          <Sku goods={curGoods} onChange={this.handleChangeSku} onClose={this.handleCloseSku} />
        )}
        <Login show={false} onChange={this.loginSuccess} />
        <View className="search-wrap">
          <AtSearchBar
            focus
            fixed
            value={searchValue}
            placeholder="搜索商品"
            onChange={this.search}
            onConfirm={this.search}
          />
        </View>
        <View className="pad40">
          {SearchList.map(ele => (
            <GoodsItem goods={ele} onChange={this.addCartOk} />
          ))}
        </View>
      </View>
    );
  }
}
export default IndexSearch as ComponentClass<PageOwnProps, PageState>;
