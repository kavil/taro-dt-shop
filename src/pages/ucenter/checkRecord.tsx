import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtDivider, AtAvatar } from 'taro-ui';
import Product from '../../components/product/productComponent';
import './score.scss';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {};

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {
  List?: any;
  opType: number;
  page: number;
  loadOver: boolean;
};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ pickup }) => ({
  ...pickup,
  List: pickup.checkRecordList
}))
export default class CheckRecordList extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '核销记录列表'
  };

  componentDidMount = () => {
    this.getList();
  };

  componentWillUnmount = () => {
    this.props.dispatch({
      type: 'pickup/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
        List: []
      }
    });
  };

  getList() {
    this.props.dispatch({
      type: 'pickup/CheckRecordList'
    });
  }

  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'pickup/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
        List: []
      }
    });
    this.getList();
  }
  async onReachBottom() {
    await this.props.dispatch({
      type: 'pickup/save',
      payload: {
        page: this.props.page + 1
      }
    });
    this.getList();
  }
  nextPage(url) {
    Taro.navigateTo({
      url: url
    });
  }

  render() {
    const { List, loadOver } = this.props;
    return (
      <View className="score-page check-record">
        {List && List.length ? (
          <View className="base-ul">
            {List.map((li) => (
              <View>
                <View className="top">
                  <View className="user">
                    <AtAvatar size="small" circle image={li.userInfo.avatarUrl} />
                    <View>
                      <View className="nick">{li.userInfo.nickName}</View>
                      <View className="nick">{li.userInfo.mobile}</View>
                    </View>
                  </View>
                  <View className="user r">
                    <View>
                      <View className="nick">核销人：{li.shopUser.nickName}</View>
                      <View className="nick">{li.shopUser.mobile}</View>
                    </View>
                    <AtAvatar size="small" circle image={li.shopUser.avatarUrl} />
                  </View>
                </View>
                <Product item={li} />
              </View>
            ))}
          </View>
        ) : (
          <View className="nodata">
            <Text className="erduufont ed-zanwushuju" />
            <View className="label">暂无数据</View>
          </View>
        )}
        {loadOver && List && List.length && (
          <View className="pad40">
            <AtDivider content="没有更多了" fontSize="24" fontColor="#ddd" lineColor="#ddd" />
          </View>
        )}
      </View>
    );
  }
}
