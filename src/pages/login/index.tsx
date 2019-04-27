import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image, Button, Form } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import './index.scss';
import wxImg from '../../static/images/wx.png';
import nbImg from '../../static/images/nb.png';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
  userInfoLoading: boolean;
  loginLoading: boolean;
  formIdArr: any[];
  userInfo: any;
}

interface PageOwnProps {
  //父组件要传
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;
@connect(({ common, loading, cart }) => ({
  ...common,
  ...cart,
  userInfoLoading: loading.effects['common/getUserInfo'],
  loginLoading: loading.effects['common/login'],
}))
class Login extends Component<IProps, {}> {
  config: Config = {
    navigationBarTitleText: '寻味知途·社区团购',
  };

  componentDidMount() {}
  componentWillUnmount() {
    Taro.eventCenter.trigger('login', false);
  }
  componentDidHide() {
    Taro.eventCenter.trigger('login', false);
  }

  loginFun = async event => {
    if (event.detail.errMsg !== 'getUserInfo:ok') return;
    const userInfo = await this.props.dispatch({
      type: 'common/getUserInfo',
    });
    const code = await this.props.dispatch({
      type: 'common/wxCode',
    });
    if (!userInfo) {
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none',
      });
      return;
    } else {
      await this.props.dispatch({
        type: 'common/login',
        payload: {
          code,
          userInfo,
        },
      });

      this.props.dispatch({
        type: 'cart/Index',
      });
      if (this.props.userInfo && this.props.userInfo.communityId) {
        Taro.switchTab({ url: '/pages/index/index' });
      } else {
        const communityId = Taro.getStorageSync('communityId');
        if (communityId) {
          Taro.removeStorageSync('communityId');
          // 没有绑定过小区的  自动绑定
          await this.bindCommunity(communityId);
          Taro.switchTab({ url: '/pages/index/index' });
        } else {
          Taro.redirectTo({ url: '/pages/neighbor/search?mode=redirect' });
          return;
        }
      }
    }
  };

  async bindCommunity(communityId) {
    await this.props.dispatch({
      type: 'neighbor/BindId',
      payload: {
        id: communityId,
      },
    });
    await this.props.dispatch({
      type: 'common/UserInfo',
    });
  }

  getFormId = e => {
    const formId = e.detail.formId;
    const formIdArr = [...this.props.formIdArr];
    formIdArr.push({ formId, createdTime: Math.floor(new Date().getTime() / 1000) });
    this.props.dispatch({
      type: 'common/save',
      payload: {
        formIdArr,
      },
    });
  };
  render() {
    const { userInfoLoading, loginLoading } = this.props;
    return (
      <Form reportSubmit onSubmit={this.getFormId}>
        <View className="login-page">
          <View className="pad40 h1">
            <View className="h2">您好</View>
            <View className="p">请点击授权关联账号，开启全新社区新零售。</View>
          </View>
          <View className="logo-wrap">
            <Button
              className="logo plain"
              plain
              openType="getUserInfo"
              onGetUserInfo={this.loginFun}
              disabled={userInfoLoading || loginLoading}
            >
              <Image className="image" src={wxImg} />
            </Button>
            <View>
              <Text className="erduufont ed-back go" />
              <Text className="erduufont ed-back go" />
              <Text className="erduufont ed-back go" />
            </View>
            <View className="logo">
              <Image className="image" src={nbImg} />
            </View>
          </View>

          <View className="pad40">
            <AtButton
              loading={userInfoLoading || loginLoading}
              openType="getUserInfo"
              onGetUserInfo={this.loginFun}
              type="primary"
              formType="submit"
            >
              微信授权登录
            </AtButton>
          </View>
        </View>
      </Form>
    );
  }
}

export default Login as ComponentClass<PageOwnProps, PageState>;
