import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtTabs, AtTabsPane, AtDivider, AtSearchBar } from 'taro-ui';
import { OrderLi } from './orderLi.component';
import './index.scss';

interface DispatchOption {
  type?: string,
  payload?: Object,
}

type PageStateProps = {
}

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any,
}

type PageOwnProps = {
  orderList?: any,
  page: number,
  loadOver: boolean,
  manage: number,
}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ order, common }) => ({
  ...order,
  ...common,
}))
export default class Order extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '小区订单',
  };

  async componentDidMount() {
    console.log(this.props.manage, this.$router.params.type);
    const st = this.$router.params.type === 'manage';
    if (st) {
      this.setState({
        manage: true
      })
    } else {
      this.handleClick(0);
    }
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
      }
    })
  }
  state = {
    current: 0,
    search: '',
    manage: false,
  }
  constructor() {
    super(...arguments)
  }
  async handleClick(value) {
    this.setState({
      current: value
    })
    const statusRange = [undefined, 201, 300, 301, 401]
    const status = statusRange[value];
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        status,
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      }
    })
    this.getOrderList();

  }
  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      }
    })
    this.getOrderList();
  }
  async onReachBottom() {
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        page: this.props.page + 1
      }
    })
    this.getOrderList();
  }
  getOrderList() {
    console.log(this.state.manage && this.state.search, this.state.manage, this.state.search);
    
    if(this.state.manage && !this.state.search){
      Taro.showToast({
        title:'请输入小区长手机号',
        icon: 'none',
      })
      return;
    }
    this.props.dispatch({
      type: 'order/orderList'
    })
  }

  async onSearchChange(value) {
    this.setState({
      search: value
    });
  }

  async onConfirm() {
    await this.props.dispatch({
      type: 'order/save',
      payload: {
        search: this.state.search,
        loadOver: false,
        refresh: true,
      }
    })
    this.getOrderList();
  }

  render() {
    const { orderList } = this.props;
    const { manage } = this.state;
    const tabList = [{ title: '全部订单' }, { title: '已付款' }, { title: '已发货' }, { title: '已完成' }];
    return (
      <View>{manage ?
        <AtSearchBar placeholder="搜索小区长手机号" value={this.state.search} onChange={this.onSearchChange} onConfirm={this.onConfirm} onActionClick={this.onConfirm} /> : ''}
        <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleClick}>
          <AtTabsPane current={this.state.current} index={0} >
            {orderList && orderList.length ?
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />
                })}
              </View> : <View className="nodata"><Text className='erduufont ed-zanwushuju'></Text><View className="label">暂无数据</View></View>}
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1} >
            {orderList && orderList.length ?
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />
                })}
              </View> : <View className="nodata"><Text className='erduufont ed-zanwushuju'></Text><View className="label">暂无数据</View></View>}
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={2} >
            {orderList && orderList.length ?
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />
                })}
              </View> : <View className="nodata"><Text className='erduufont ed-zanwushuju'></Text><View className="label">暂无数据</View></View>}
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={3} >
            {orderList && orderList.length ?
              <View className="order-ul">
                {orderList.map(order => {
                  return <OrderLi key={order.id} order={order} />
                })}
              </View> : <View className="nodata"><Text className='erduufont ed-zanwushuju'></Text><View className="label">暂无数据</View></View>}
          </AtTabsPane>

        </AtTabs>
        {this.props.loadOver && orderList && orderList.length
          ? <AtDivider content='没有更多了' fontSize="24" fontColor='#ddd' lineColor='#ddd' /> : ''}
      </View>
    )
  }
}
