import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtSearchBar } from 'taro-ui';
import CommunityItem from '../../components/communityItem/communityItemComponent';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  token: any;
  userInfo: any;
  NearbyList: any[];
  SearchList: any[];
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ neighbor, common }) => ({
  ...common,
  ...neighbor,
}))
class NeighborSearch extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '邻居圈',
  };

  async componentDidMount() {
    // 获取地理位置
    let local;
    try {
      local = await Taro.getLocation({ type: 'wgs84' });
    } catch (error) {
      this.setState({ localSetting: false });
    }
    // 默认附近小区
    if (local)
      await this.props.dispatch({
        type: 'neighbor/Search',
        payload: {
          latitude: local.latitude,
          longitude: local.longitude,
        },
      });
  }

  async onPullDownRefresh() {
    await this.componentDidMount();
    Taro.stopPullDownRefresh();
  }

  openSetting = async () => {
    const { errMsg }: any = await Taro.openSetting();
    if (errMsg === 'openSetting:ok') this.componentDidMount();
  };

  searchCommunity = async value => {
    this.setState({ searchValue: value });
    if (this.timeCo) clearTimeout(this.timeCo);
    this.timeCo = setTimeout(async () => {
      await this.props.dispatch({
        type: 'neighbor/Search',
        payload: {
          name: value,
        },
      });
    }, 1500);
  };

  bindOk = async value => {
    await Taro.showModal({
      title: '提示',
      content: `已成功绑定 ${value.name}`,
      showCancel: false,
    });
    Taro.navigateBack();
  };

  timeCo;
  state = {
    localSetting: true,
    searchValue: '',
  };

  render() {
    const { SearchList } = this.props;
    const { localSetting, searchValue } = this.state;
    return (
      <View className="neighbor-page">
        <View className="search-wrap">
          <AtSearchBar
            focus
            fixed
            value={searchValue}
            placeholder="搜索小区"
            onChange={this.searchCommunity}
            onConfirm={this.searchCommunity}
          />
        </View>
        <View className="pad20">
          {SearchList.map(ele => (
            <CommunityItem key={ele.id} item={ele} onChange={this.bindOk.bind(this, ele)} />
          ))}
        </View>
        {!localSetting && (
          <View className="pad20">
            <AtButton type="primary" onClick={this.openSetting}>
              <Text className="white">打开位置权限</Text>
            </AtButton>
            <View className="p">需要获取您的位置信息查找附近小区</View>
          </View>
        )}
      </View>
    );
  }
}
export default NeighborSearch as ComponentClass<PageOwnProps, PageState>;
