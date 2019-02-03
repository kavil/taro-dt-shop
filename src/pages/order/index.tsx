import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtTabs, AtTabsPane, AtDivider, AtSearchBar } from 'taro-ui';
import { OrderLi } from './orderLi.component';
import './index.scss';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {};

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {
  orderList?: any;
  page: number;
  loadOver: boolean;
  manage: number;
};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ order, common }) => ({
  ...order,
  ...common,
}))
export default class Order extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '我的订单',
    backgroundColor: '#f8f8f8',
  };

  async componentDidMount() {
    this.handleClick(0);
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'order/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
        orderList: [],
        search: undefined,
      },
    });
  }
  state = {
    current: 0,
    search: '',
    manage: false,
  };
  constructor() {
    super(...arguments);
  }
  async handleClick(value) {
    this.setState({
      current: value,
      search: '',
    });
    const statusRange = [undefined, 0, 201, 301, 400];
    const status = statusRange[value];
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        search: undefined,
        status,
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      },
    });
    this.getOrderList();
  }
  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      },
    });
    this.getOrderList();
  }
  async onReachBottom() {
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        page: this.props.page + 1,
      },
    });
    this.getOrderList();
  }
  getOrderList() {
    this.props.dispatch({
      type: 'order/OrderList',
    });
  }

  async onConfirm() {
    if (this.timeCo) clearTimeout(this.timeCo);
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        search: this.state.search,
        loadOver: false,
        refresh: true,
      },
    });
    this.getOrderList();
  }

  async onSearchChange(value) {
    this.setState({
      search: value,
    });
    if (this.timeCo) clearTimeout(this.timeCo);
    this.timeCo = setTimeout(async () => {
      this.onConfirm();
    }, 1500);
  }
  timeCo;

  render() {
    const { orderList, loadOver } = this.props;
    const { current } = this.state;
    const tabList = [
      { title: '全部' },
      { title: '待付款' },
      { title: '待收货' },
      { title: '待评价' },
      { title: '退换' },
    ];
    return (
      <View className="order-page">
        <AtSearchBar
          fixed
          placeholder="搜索"
          value={this.state.search}
          onChange={this.onSearchChange}
          onConfirm={this.onConfirm}
          onActionClick={this.onConfirm}
        />
        <AtTabs current={current} swipeable={true} tabList={tabList} onClick={this.handleClick}>
          <AtTabsPane current={current} index={0}>
            {orderList && orderList.length ? (
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />;
                })}
              </View>
            ) : (
              <View className="nodata">
                <Text className="erduufont ed-zanwushuju" />
                <View className="label">暂无订单</View>
              </View>
            )}
          </AtTabsPane>
          <AtTabsPane current={current} index={1}>
            {orderList && orderList.length ? (
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />;
                })}
              </View>
            ) : (
              <View className="nodata">
                <Text className="erduufont ed-zanwushuju" />
                <View className="label">暂无订单</View>
              </View>
            )}
          </AtTabsPane>
          <AtTabsPane current={current} index={2}>
            {orderList && orderList.length ? (
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />;
                })}
              </View>
            ) : (
              <View className="nodata">
                <Text className="erduufont ed-zanwushuju" />
                <View className="label">暂无数据</View>
              </View>
            )}
          </AtTabsPane>
          <AtTabsPane current={current} index={3}>
            {orderList && orderList.length ? (
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />;
                })}
              </View>
            ) : (
              <View className="nodata">
                <Text className="erduufont ed-zanwushuju" />
                <View className="label">暂无数据</View>
              </View>
            )}
          </AtTabsPane>
          <AtTabsPane current={current} index={4}>
            {orderList && orderList.length ? (
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />;
                })}
              </View>
            ) : (
              <View className="nodata">
                <Text className="erduufont ed-zanwushuju" />
                <View className="label">暂无数据</View>
              </View>
            )}
          </AtTabsPane>
        </AtTabs>
        {loadOver && orderList && orderList.length && (
          <AtDivider content="没有更多了" fontSize="24" fontColor="#ddd" lineColor="#ddd" />
        )}
      </View>
    );
  }
}
