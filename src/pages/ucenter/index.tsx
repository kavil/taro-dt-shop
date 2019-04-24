import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Image, Text, Form, Button } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtList, AtListItem, AtTag, AtButton } from 'taro-ui';
import Login from '../../components/login/loginComponent';
import './index.scss';
import { tip } from '../../utils/tool';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
  userInfo: any;
  formIdArr: any[];
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ ucenter, common }) => ({
  ...common,
  ...ucenter,
}))
class Ucenter extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '个人中心',
  };

  async componentDidShow() {
    if (Taro.getStorageSync('gotoOrder')) {
      Taro.setStorageSync('gotoOrder', '');
      this.nextPage('/pages/order/index');
    }
  }

  async componentDidMount() {
    if (this.$router.params.to) {
      await this.nextPage('/pages/' + this.$router.params.to + '/index');
    }
    const vipSave = await this.props.dispatch({
      type: 'ucenter/VipSave',
    });
    this.setState({ vipSave });
  }

  async onPullDownRefresh() {
    this.componentDidMount();
    await this.props.dispatch({
      type: 'common/UserInfo',
    });
    Taro.stopPullDownRefresh();
  }

  nextPage = url => {
    if (!this.props.userInfo.id) {
      tip('请先授权登录');
      return;
    }
    Taro.navigateTo({ url });
  };
  loginBtn = () => {
    Taro.eventCenter.trigger('login', true);
  };
  loginSuccess = () => {
    // this.onPullDownRefresh();
  };
  callme = () => {
    Taro.makePhoneCall({
      phoneNumber: '18979084445',
    });
  };
  callkf = () => {
    Taro.makePhoneCall({
      phoneNumber: '18979084445',
    });
  };
  nextMini = () => {
    Taro.navigateToMiniProgram({
      appId: 'wx022960c7a872290f',
      path: '/pages/index/index?colonelId=' + this.props.userInfo.id,
      envVersion: 'trial',
      extraData: {
        colonelId: this.props.userInfo.id,
      },
    });
  };
  getFormId = e => {
    const formId = e.detail.formId;
    const formIdArr = [...this.props.formIdArr];
    formIdArr.push({ formId, createdTime: Math.floor(new Date().getTime() / 1000) });
    console.log(formIdArr, '<---------------------formIdArr');
    this.props.dispatch({
      type: 'common/save',
      payload: {
        formIdArr,
      },
    });
  };
  state = {
    vipSave: 0,
  };

  render() {
    const { userInfo } = this.props;
    const { vipSave } = this.state;
    return (
      <View className="ucenter-page">
        <Login show={false} onChange={this.loginSuccess} />

        {!userInfo.id ? (
          <View className="center">
            <AtButton size="small" type="secondary" onClick={this.loginBtn}>
              登录
            </AtButton>
          </View>
        ) : (
          <View className="me-wrap">
            <View className="info">
              <View className="h3">
                {userInfo.nickName}
                {userInfo.isColonel && (
                  <AtTag active={true} size="small" circle>
                    小区长
                  </AtTag>
                )}
              </View>
              <View className="p">{userInfo.mobile || ''}</View>
            </View>
            <View className="ava-wrap">
              <Image className="image" mode="scaleToFill" src={userInfo.avatarUrl} />
            </View>
          </View>
        )}
        <Form reportSubmit onSubmit={this.getFormId}>
          {userInfo.id && (
            <Button
              plain
              formType="submit"
              className="plain"
              onClick={this.nextPage.bind(this, '/pages/vip/index')}
            >
              <View className="vip-bar">
                <View className="left">
                  {userInfo.level === 0 ? (
                    <View className="tag">开通会员</View>
                  ) : (
                    <View className="tag">您已开通会员</View>
                  )}
                  {vipSave && (
                    <Text className="text">
                      已为您省了
                      <Text style={{ color: '#f5735b' }}>{vipSave.toFixed(1)}</Text>元
                    </Text>
                  )}
                </View>
                <Text className="right">
                  {userInfo.level === 0 ? '立即开通' : '续费'}
                  <Text className="erduufont ed-back go" />
                </Text>
              </View>
            </Button>
          )}
          <View className="divsion" />
          <View className="operate-wrap">
            <Button
              className="li plain"
              formType="submit"
              plain
              onClick={this.nextPage.bind(this, '/pages/order/index')}
            >
              <Text className="erduufont ed-peihuodan red" />
              全部订单
            </Button>
            <Button
              className="li plain"
              formType="submit"
              plain
              onClick={this.nextPage.bind(this, '/pages/order/index?tab=1')}
            >
              <Text className="erduufont ed-tixian" />
              待付款
            </Button>
            <Button
              className="li plain"
              formType="submit"
              plain
              onClick={this.nextPage.bind(this, '/pages/order/index?tab=2')}
            >
              <Text className="erduufont ed-quhuo" />
              待收货
            </Button>
            <Button
              className="li plain"
              formType="submit"
              plain
              onClick={this.nextPage.bind(this, '/pages/order/index?tab=3')}
            >
              <Text className="erduufont ed-comment" />
              待评价
            </Button>
            {/* <View className="li" onClick={this.nextPage.bind(this, '/pages/order/index?tab=400')}>
            <Text className="erduufont ed-dingdan" />
            退换/售后
          </View> */}
          </View>

          {userInfo.isColonel ? (
            <View>
              <View className="divsion" />
              <View className="ul">
                <AtList>
                  <Button className="li plain" formType="submit" plain onClick={this.nextMini}>
                    <AtListItem arrow="right" title="管理我的小区" />
                  </Button>
                </AtList>
              </View>
            </View>
          ) : (
            <View>
              <View className="divsion" />
              <View className="ul">
                <AtList>
                  <Button
                    className="li plain"
                    formType="submit"
                    plain
                    onClick={this.nextPage.bind(this, '/pages/neighbor/search')}
                  >
                    <AtListItem arrow="right" title="切换小区" />
                  </Button>
                </AtList>
              </View>
            </View>
          )}
          <View className="divsion" />
          <View className="ul">
            <AtList>
              <Button
                className="li plain"
                formType="submit"
                plain
                onClick={this.nextPage.bind(this, '/pages/ucenter/coupon')}
              >
                <AtListItem arrow="right" title="我的红包" />
              </Button>
              <Button
                className="li plain"
                formType="submit"
                plain
                onClick={this.nextPage.bind(this, '/pages/ucenter/score')}
              >
                <AtListItem arrow="right" title="我的积分" />
              </Button>
            </AtList>
          </View>

          <View className="divsion" />
          <View className="ul">
            <AtList>
              <Button
                className="li plain"
                formType="submit"
                plain
                onClick={this.nextPage.bind(this, '/pages/colonelApply/index')}
              >
                <AtListItem arrow="right" title="小区长申请" />
              </Button>
              <Button className="li plain" formType="submit" plain onClick={this.callme}>
                <AtListItem arrow="right" title="供应商联系" />
              </Button>
            </AtList>
          </View>
          <View className="contact-wrap">
            <AtButton circle size="small" type="secondary" className="contact" open-type="contact">
              联系客服
            </AtButton>
            <View className="callkf" onClick={this.callkf}>
              18979084445
            </View>
          </View>
        </Form>
      </View>
    );
  }
}
export default Ucenter as ComponentClass<PageOwnProps, PageState>;
