import Taro, { Component } from '@tarojs/taro';
import { View, Text, Picker } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtDivider } from 'taro-ui';
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
  accountList?: any,
  opType: number,
  page: number,
  loadOver: boolean,
}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps


@connect(({ account }) => ({
  ...account,
}))
export default class List extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '明细列表',
  };

  componentDidMount = () => {
    this.getAccountList();
  };

  getAccountList() {
    this.props.dispatch({
      type: 'account/accountList'
    })
  }

  async changeType(event) {
    const opType = event.detail.value;
    console.log(opType);
    await this.props.dispatch({
      type: 'account/save',
      payload: {
        opType,
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      }
    })
    this.getAccountList();
  }

  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'account/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      }
    })
    this.getAccountList();
  }
  async onReachBottom() {
    await this.props.dispatch({
      type: 'account/save',
      payload: {
        page: this.props.page + 1
      }
    })
    this.getAccountList();
  }
  nextPage(url) {
    Taro.navigateTo({
      url: url
    })
  }

  typeRange = ['全部类型', '收入', '提现', '其他']

  render() {
    const { accountList } = this.props;
    return (
      <View className="account-page list">
        <Picker className="pick" mode="selector" range={this.typeRange} value={this.props.opType}
          onChange={this.changeType.bind(this)}>{this.typeRange[this.props.opType]}
          <Text className='erduufont ed-back down'></Text>
        </Picker>
        {accountList && accountList.length ?
          <View className="base-ul">
            {accountList.map((item) => {
              return <View key={item.id} className="li" onClick={this.nextPage.bind(this, `./detail?id=${item.id}`)}>
                <View className="left">
                  <View className='h2'>{item.order_sn == 0 ? '调账' : ('订单号' + item.order_sn)}</View>
                  <View className='type'>[{this.typeRange[item.opType]}]</View>
                  <View className='time'>{item.createdTime}</View>
                </View>
                <View className="right">
                  {item.account < 0 ?
                    <View className='money green'>{item.account}</View> :
                    <View className='money yellow'>+{item.account}</View>}
                  <View className='type'>余额￥{item.totalAccount}</View>
                </View>
              </View>
            })}
          </View> : <View className="nodata"><Text className='erduufont ed-zanwushuju'></Text><View className="label">暂无数据</View></View>}
        {this.props.loadOver && accountList && accountList.length
          ? <AtDivider content='没有更多了' fontSize="24" fontColor='#ddd' lineColor='#ddd' /> : ''}
      </View>
    )
  }
}
