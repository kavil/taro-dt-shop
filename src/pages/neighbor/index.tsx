import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtSearchBar, AtIcon, AtNoticebar } from 'taro-ui';
import CommunityItem from '../../components/communityItem/communityItemComponent';
import Login from '../../components/login/loginComponent';
import communityImg from '../../static/images/community.png';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  token: any;
  NearbyList: any[];
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
  userInfo: any;
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ neighbor, common }) => ({
  ...neighbor,
  ...common,
}))
class Neighbor extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '邻居圈',
  };

  async componentDidShow() {
    this.setState({ userInfo: this.props.userInfo });
    if (!this.props.token) {
      this.setState({ init: true });
      return;
    }
    if (this.props.userInfo.uid) {
      // 获取正常数据
      // await this.props.dispatch({
      //   type: 'neighbor/Status',
      // });
    } else {
      // 获取地理位置
      let local;
      try {
        local = await Taro.getLocation({ type: 'wgs84' });
      } catch (error) {
        this.setState({ localSetting: false });
      }
      // 推荐小区
      if (local)
        await this.props.dispatch({
          type: 'neighbor/NearbyList',
          payload: {
            latitude: local.latitude,
            longitude: local.longitude,
          },
        });
    }
    this.setState({ init: true });
  }

  async onPullDownRefresh() {
    await this.componentDidShow();
    Taro.stopPullDownRefresh();
  }
  refresh = async value => {
    await Taro.showModal({
      title: '提示',
      content: `已成功绑定 ${value.name}`,
      showCancel: false,
    });
    await this.componentDidShow();
  };

  openSetting = async () => {
    const { errMsg }: any = await Taro.openSetting();
    if (errMsg === 'openSetting:ok') this.componentDidShow();
  };
  loginFun = async () => {
    Taro.login();
    Taro.eventCenter.trigger('login', true);
  };
  loginSuccess = async _ => {
    this.componentDidShow();
  };
  searchCommunity = _ => {};
  gotoSearch = e => {
    e.preventDefault();
    e.stopPropagation();
    Taro.navigateTo({ url: '/pages/neighbor/search' });
  };

  timeCo;
  state = {
    myCommunity: false,
    init: false,
    localSetting: true,
    userInfo: {},
  };

  render() {
    const { NearbyList, token } = this.props;
    const { init, localSetting, userInfo }: any = this.state;
    console.log(userInfo.uid);

    return (
      <View className="neighbor-page">
        <Login show={false} onChange={this.loginSuccess} />
        {init && (
          <View>
            {userInfo && userInfo.communityId ? (
              <View>
                <View className="pad20 top">
                  <View className="community-wrap">
                    <View className="left">
                      <Image src={communityImg} />
                      {userInfo.name}
                    </View>
                    <View className="right" onClick={this.gotoSearch}>
                      更换
                      <Text className="erduufont ed-back go" />
                    </View>
                  </View>
                  <View className="features">
                    <View className="li">
                      <Text className="erduufont ed-write blue-bg" />
                      写评测
                    </View>
                    <View className="li">
                      <Text className="erduufont ed-paizhao purple-bg" />
                      小区美拍
                    </View>
                    <View className="li">
                      <Text className="erduufont ed-car yellow-bg" />
                      小区拼车
                    </View>
                    <View className="li">
                      <Text className="erduufont ed-wuye red-bg" />
                      小区物业
                    </View>
                    <View className="li">
                      <Text className="erduufont ed-weixiu gray-bg" />
                      维修装修
                    </View>
                  </View>
                  <View className="announcement">
                    <AtNoticebar icon="volume-plus">小区公告</AtNoticebar>
                  </View>
                </View>
                <View className="pad40 h2" style={{color: '#aaa', textAlign: 'center'}}>即将开放</View>
              </View>
            ) : (
              <View>
                <View className="pad40 h2">
                  邻居圈
                  <View className="h3">{!token ? '请先登录' : '绑定您所在小区'}</View>
                  <View className="p">俗话说远亲不如近邻，精彩即将开启</View>
                  {!token && (
                    <View className="padtb40">
                      <AtButton type="primary" onClick={this.loginFun}>
                        <Text className="white">请先授权登录</Text>
                      </AtButton>
                    </View>
                  )}
                </View>
                {token && (
                  <View className="pad20">
                    <View className="h3">附近小区</View>
                    <View className="search-wrap">
                      <AtSearchBar
                        value=""
                        placeholder="搜索小区"
                        onChange={this.searchCommunity}
                      />
                      <View className="search-mask" onClick={this.gotoSearch} />
                    </View>
                    {NearbyList.map(ele => (
                      <CommunityItem
                        key={ele.id}
                        item={ele}
                        onChange={this.refresh.bind(this, ele)}
                      />
                    ))}
                    {NearbyList && !NearbyList.length && (
                      <View className="p" style={{ textAlign: 'center', marginTop: '30px' }}>
                        附近暂无开通小区，直接搜索试试
                      </View>
                    )}
                  </View>
                )}
                {!localSetting && (
                  <View className="pad20">
                    <AtButton type="primary" onClick={this.openSetting}>
                      <Text className="white">打开位置权限</Text>
                    </AtButton>
                    <View className="p">需要获取您的位置信息查找附近小区</View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
}
export default Neighbor as ComponentClass<PageOwnProps, PageState>;
