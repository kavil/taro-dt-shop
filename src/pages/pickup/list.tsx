import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtTabs, AtTabsPane, AtDivider } from 'taro-ui';
import { OrderLi } from '../order/orderLi.component';
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
}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ order }) => ({
  ...order,
}))
export default class PickupList extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '取件订单',
  };

  componentDidMount() {
    this.handleClick(0);
  }
  componentWillUnmount(){
    this.props.dispatch({
      type: 'order/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
        orderList: [],
      }
    })
  }
  state = {
    current: 0,
  }
  constructor() {
    super(...arguments)
  }
  async handleClick(value) {
    this.setState({
      current: value
    })
    const statusRange = [300, 301]
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
    this.props.dispatch({
      type: 'order/orderList'
    })
  }

  render() {
    const tabList = [{ title: '待取件' }, { title: '已取件' }];
    const { orderList } = this.props;
    return (
      <View>
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
        </AtTabs>
        {this.props.loadOver && orderList && orderList.length
          ? <AtDivider content='没有更多了' fontSize="24" fontColor='#ddd' lineColor='#ddd' /> : ''}
      </View>
    )
  }
}
