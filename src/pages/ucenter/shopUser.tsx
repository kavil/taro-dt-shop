import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtSegmentedControl, AtList, AtListItem, AtActionSheet, AtActionSheetItem } from 'taro-ui';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  ShopUser: any;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ ucenter }) => ({
  ...ucenter,
}))
class ShopUser extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '门店成员',
  };

  async componentDidMount() {
    await this.props.dispatch({
      type: 'ucenter/ShopUser',
    });
  }

  async onPullDownRefresh() {
    await this.componentDidMount();
    Taro.stopPullDownRefresh();
  }
  handleClick = async current => {
    this.setState({
      current,
    });
    await this.props.dispatch({
      type: 'ucenter/save',
      payload: {
        ShopUser: {
          ...this.props.ShopUser,
          type: current,
          page: 1, // 归位
          refresh: true,
          loadOver: false,
        },
      },
    });
    await this.getList();
  };
  async onReachBottom() {
    await this.props.dispatch({
      type: 'ucenter/save',
      payload: {
        ShopUser: {
          ...this.props.ShopUser,
          page: this.props.ShopUser.page + 1,
        },
      },
    });
    await this.getList();
  }
  getList() {
    this.props.dispatch({
      type: 'ucenter/ShopUser',
    });
  }
  makePhoneCall(phoneNumber) {
    Taro.makePhoneCall({ phoneNumber });
  }

  openAction(li) {
    if (this.state.current > 0) {
      this.setState({ open: true, curli: li });
    }
  }
  action(isActive) {
    const { id }: any = this.state.curli;
    const res = this.props.dispatch({
      type: 'shop/ApplyAction',
      payload: {
        isActive,
        id,
      },
    });
    if (res) {
      this.componentDidMount();
    }
    this.setState({ open: false });
  }
  state = {
    current: 0,
    open: false,
    curli: null,
  };

  render() {
    const { ShopUser } = this.props;
    const { current, open }: any = this.state;
    const opText = ['', '审核', '重新审核'];

    const { List } = ShopUser;
    return (
      <View className="coupon-page card-page">
        <AtActionSheet
          isOpened={open}
          cancelText="取消"
          title="通过后该成员即可帮助核销门店消费券等操作"
        >
          <AtActionSheetItem onClick={this.action.bind(this, 2)}>通过</AtActionSheetItem>
          <AtActionSheetItem onClick={this.action.bind(this, 0)}>拒绝</AtActionSheetItem>
        </AtActionSheet>
        <View className="pad40">
          <AtSegmentedControl
            values={['门店成员', '待审核', '已拒绝']}
            onClick={this.handleClick.bind(this)}
            current={current}
          />
        </View>
        <View className="card-ul">
          {List && List.length ? (
            <AtList>
              {List.map(li => (
                <AtListItem
                  title={li.nickName}
                  note={li.mobile}
                  extraText={opText[current]}
                  thumb={li.avatarUrl}
                  onClick={this.openAction.bind(this, li)}
                />
              ))}
            </AtList>
          ) : (
            <View className="nodata">
              <Text className="erduufont ed-zanwushuju" />
              <View className="label">暂无数据</View>
            </View>
          )}
        </View>
      </View>
    );
  }
}
export default ShopUser as ComponentClass<PageOwnProps, PageState>;
