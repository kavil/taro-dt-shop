import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtTag, AtButton } from 'taro-ui';
import CheckItem from '../../components/checkItem/checkItemComponent';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  userInfo: any;
  vipOpenDays: any;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ vip, common, ucenter }) => ({
  ...vip,
  ...common,
  ...ucenter,
}))
class Vip extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '会员+',
  };

  async componentDidMount() {
    Taro.showShareMenu({
      withShareTicket: true,
    });
    const vipSave = await this.props.dispatch({
      type: 'ucenter/VipSave',
    });
    this.setState({ vipSave });
    await this.props.dispatch({
      type: 'vip/OpenDays',
    });
  }
  async onPullDownRefresh() {
    await this.componentDidMount();
    Taro.stopPullDownRefresh();
  }

  onShareAppMessage(event) {
    console.log(event);
    return {
      title: `小区团购超低价，用会员再省${this.state.vipSave}元`,
      path: `/pages/index/index?sharefrom=${this.props.userInfo.id}`,
    };
  }

  payVip = async () => {
    const payParam = await this.props.dispatch({
      type: 'vip/Prepay',
      payload: {
        value: this.state.checked,
      },
    });
    const res = await Taro.requestPayment({
      timeStamp: payParam.timeStamp,
      nonceStr: payParam.nonceStr,
      package: payParam.package,
      signType: payParam.signType,
      paySign: payParam.paySign,
      success: async res => {
        if (res.errMsg !== 'requestPayment:fail cancel') {
          await this.props.dispatch({
            type: 'common/UserInfo',
          });
          this.componentDidMount();
          Taro.showToast({
            title: '恭喜！开通成功',
            icon: 'success',
          });
        } else {
          Taro.showToast({
            title: '付款失败，请重试',
            icon: 'none',
          });
        }
      },
      fail: async res => {
        if (res.errMsg !== 'requestPayment:fail cancel') {
          Taro.showToast({
            title: '付款失败，请重试',
            icon: 'none',
          });
        }
      },
    });
  };

  checkItem = async checked => {
    this.setState({ checked });
  };
  state = {
    checked: 3,
    vipSave: null,
  };
  render() {
    const { userInfo, vipOpenDays } = this.props;
    const { checked, vipSave } = this.state;
    let overTime;
    if (vipOpenDays) {
      const tmp = new Date(new Date().getTime() + vipOpenDays * 86400000);
      overTime = tmp.getFullYear() + '-' + (tmp.getMonth() + 1) + '-' + tmp.getDate();
    }
    return (
      <View className="vip-page">
        <View className="circle" />
        <View className="top">
          <View className="left">
            <View className="ava-wrap">
              <Image className="img" src={userInfo.avatarUrl} />
            </View>
            <View className="info">
              <View className="h2">{userInfo.nickName}</View>
              {userInfo.level && (
                <AtTag active={true} size="small" circle>
                  会员
                </AtTag>
              )}
              {userInfo.level && overTime && <View className="p">{overTime} 会员到期</View>}
            </View>
          </View>
          <View className="right">
            会员说明
            <Text className="erduufont ed-bangzhu" />
          </View>
        </View>

        <View className="vip-list">
          <View className="center">
            {userInfo.level ? (
              <View className="h4">
                您的会员还剩 <Text className="b">{vipOpenDays}</Text> 天
              </View>
            ) : (
              <View className="h4">
                现在开通会员 <Text className="erduufont ed-kaitonghuiyuan" />
              </View>
            )}
            <View className="likebtn">立享各大会员特权</View>
            {vipSave && (
              <View className="link">
                会员期间已为您节省￥{vipSave}
                <Text className="erduufont ed-back go" />
              </View>
            )}
          </View>
          <View className="ul">
            <View className="li">
              <Text className="erduufont ed-renwuguanli" />
              <View className="p">会员任务</View>
            </View>
            <View className="li">
              <Text className="erduufont ed-jinrongzhuanxiangjiage" />
              <View className="p">会员专享价</View>
            </View>
            <View className="li">
              <Text className="erduufont ed-peisong" />
              <View className="p">优先配送</View>
            </View>
            <View className="li">
              <Text className="erduufont ed-jifen" />
              <View className="p">积分加倍</View>
            </View>
          </View>
        </View>
        <View className="pad40">
          <View className="h3">选择会员套餐</View>
          <View className="choose">
            <View className="item">
              <View className="center">
                <CheckItem
                  value={1}
                  checked={checked === 1}
                  onChange={this.checkItem.bind(this, 1)}
                />
                <View className="much">1个月</View>
                <View className="money">
                  ￥6 <Text className="del">￥8</Text>
                </View>
              </View>
            </View>
            <View className="item">
              <View className="center">
                <CheckItem
                  value={3}
                  checked={checked === 3}
                  onChange={this.checkItem.bind(this, 3)}
                />
                <View className="much">3个月</View>
                <View className="money">
                  ￥12 <Text className="del">￥24</Text>
                </View>
              </View>
            </View>
            <View className="item">
              <View className="center">
                <CheckItem
                  value={6}
                  checked={checked === 6}
                  onChange={this.checkItem.bind(this, 6)}
                />
                <View className="much">6个月</View>
                <View className="money">
                  ￥28 <Text className="del">￥48</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="btn-wrap">
            <AtButton circle type="primary" onClick={this.payVip}>
              立即{userInfo.level ? '续费' : '开通'}
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}
export default Vip as ComponentClass<PageOwnProps, PageState>;
