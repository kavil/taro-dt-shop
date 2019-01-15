import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image, Button } from '@tarojs/components';
import { AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';
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
}

interface PageOwnProps {
  //父组件要传
  show: boolean;
  onChange?: Function;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;
@connect(({ common, loading }) => ({
  ...common,
  userInfoLoading: loading.effects['common/getUserInfo'],
  loginLoading: loading.effects['common/login'],
}))
class Login extends Component<IProps, {}> {
  componentWillReceiveProps(props) {
    this.setState({
      openLogin: props.show,
    });
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
      this.setState({
        openLogin: false,
      });
      if (this.props.onChange) this.props.onChange(userInfo);
    }
  };

  state = {
    openLogin: false,
  };

  render() {
    const { userInfoLoading, loginLoading } = this.props;
    const { openLogin } = this.state;

    return (
      <AtModal isOpened={openLogin}>
        <AtModalHeader>微信授权</AtModalHeader>
        <AtModalContent>
          <View className="logo-wrap">
            <View className="logo">
              <Image className="image" src={wxImg} />
            </View>
            <View>
              <Text className="erduufont ed-back go" />
              <Text className="erduufont ed-back go" />
              <Text className="erduufont ed-back go" />
            </View>
            <View className="logo">
              <Image className="image" src={nbImg} />
            </View>
          </View>
        </AtModalContent>
        <AtModalAction>
          <Button
            loading={userInfoLoading || loginLoading}
            openType="getUserInfo"
            onGetUserInfo={this.loginFun}
            type="primary"
          >
            确认
          </Button>
        </AtModalAction>
      </AtModal>
    );
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Login as ComponentClass<PageOwnProps, PageState>;
