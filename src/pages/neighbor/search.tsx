import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtSearchBar } from 'taro-ui';
import CommunityItem from '../../components/communityItem/communityItemComponent';
import { tip } from '../../utils/tool';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  token: any;
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
  ...neighbor
}))
class NeighborSearch extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '选择附近小区点'
  };

  async componentDidMount() {
    if (this.$router.params.noApply) this.setState({ noApply: false });
    // 获取地理位置
    let local;
    try {
      local = await Taro.getLocation({ type: 'wgs84' });
      this.setState({ localSetting: true });
    } catch (error) {
      this.setState({ localSetting: false });
    }
    // 默认附近小区
    if (local) {
      this.setState({ loaded: false });
      await this.props.dispatch({
        type: 'neighbor/Search',
        payload: {
          latitude: local.latitude,
          longitude: local.longitude
        }
      });
      this.setState({ local, loaded: true });
    }
  }

  async onPullDownRefresh() {
    await this.componentDidMount();
    Taro.stopPullDownRefresh();
  }

  openSetting = async () => {
    const { errMsg }: any = await Taro.openSetting();
    console.log(errMsg);

    if (errMsg === 'openSetting:ok') this.componentDidMount();
  };

  onConfirm = async (e) => {
    const value = e.detail.value.trim();
    if (this.timeCo) clearTimeout(this.timeCo);
    const { local }: any = this.state;
    if (!local.latitude) tip('请先打开位置授权');
    this.setState({ loaded: false });
    await this.props.dispatch({
      type: 'neighbor/Search',
      payload: {
        name: value,
        latitude: local.latitude,
        longitude: local.longitude
      }
    });
    this.setState({ loaded: true });
  };

  searchCommunity = async (val) => {
    const value = val.trim();
    if (!value) return;
    this.setState({ searchValue: value });
    if (this.timeCo) clearTimeout(this.timeCo);
    const { local }: any = this.state;
    if (!local.latitude) tip('请先打开位置授权');
    this.timeCo = setTimeout(async () => {
      this.setState({ loaded: false });
      await this.props.dispatch({
        type: 'neighbor/Search',
        payload: {
          name: value,
          latitude: local.latitude,
          longitude: local.longitude
        }
      });
      this.setState({ loaded: true });
    }, 1500);
  };

  bindOk = async (value) => {
    await Taro.showModal({
      title: '提示',
      content: `已成功绑定 ${value.name}`,
      showCancel: false
    });
    if (this.$router.params.mode === 'redirect') {
      Taro.switchTab({ url: '/pages/index/index' });
    } else {
      Taro.navigateBack();
    }
  };

  timeCo;
  state = {
    localSetting: true,
    searchValue: '',
    noApply: true,
    local: {},
    loaded: false
  };

  render() {
    const { SearchList } = this.props;
    const { localSetting, searchValue, noApply, loaded } = this.state;
    return (
      <View className="neighbor-page">
        <View className="search-wrap">
          <AtSearchBar focus fixed value={searchValue} placeholder="搜索小区" onChange={this.searchCommunity} onConfirm={this.onConfirm} />
        </View>
        <View className="pad20 pt">
          {SearchList.map((ele) => (
            <CommunityItem key={ele.id} item={ele} noApply={noApply} onChange={this.bindOk.bind(this, ele)} />
          ))}
          {!SearchList.length && loaded && <View className="nodata">该地区暂无小区长</View>}
        </View>
        {!localSetting && (
          <View className="pad20 pt">
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
