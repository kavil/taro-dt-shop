import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Image, Text, Form, Button } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import {
  AtList,
  AtListItem,
  AtTag,
  AtButton,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtAvatar,
} from 'taro-ui';
import Login from '../../components/login/loginComponent';
import './index.scss';
import { tip } from '../../utils/tool';
import Product from '../../components/product/productComponent';

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
  accountInfo: any;
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ ucenter, common, account }) => ({
  ...common,
  ...ucenter,
  ...account,
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
    if (Taro.getStorageSync('gotoCard')) {
      Taro.setStorageSync('gotoCard', '');
      this.nextPage('/pages/ucenter/card');
    }
  }

  async componentDidMount() {
    if (this.$router.params.to) {
      await this.nextPage('/pages/' + this.$router.params.to + '/index');
    }
    await this.props.dispatch({
      type: 'account/load',
    });
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

  scanCode = async () => {
    const res: any = await Taro.scanCode({
      onlyFromCamera: true,
    });
    console.log(res);
    if (res.errMsg !== 'scanCode:ok') {
      tip('无效二维码');
      return;
    }
    const cardInfo = await this.props.dispatch({
      type: 'ucenter/CardCheckOut',
      payload: {
        checkcode: res.result,
      },
    });
    if (!cardInfo.id) {
      tip('无效二维码！');
      return;
    }
    this.setState({
      cardInfo,
      checkcode: res.result,
      open: true,
    });
  };

  cancel() {
    this.setState({
      open: false,
    });
  }

  sure = async () => {
    const res = await this.props.dispatch({
      type: 'ucenter/CardcheckIt',
      payload: {
        checkcode: this.state.checkcode,
      },
    });
    console.log(res, 'hhhhhhhres');
    this.setState({
      open: false,
    });
    if (res) {
      await Taro.showModal({
        title: '提示',
        content: '核销成功',
        showCancel: false,
      });
    }
  };

  state = {
    open: false,
    checkcode: null,
    cardInfo: null,
  };

  render() {
    const { userInfo, accountInfo } = this.props;

    const { open, cardInfo }: any = this.state;

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
                )}{' '}
                {userInfo.cshopId && (
                  <AtTag active={true} size="small" circle>
                    门店管理员
                  </AtTag>
                )}
              </View>
              <View className="p">{userInfo.mobile || ''}</View>
              <View className="p">{userInfo.mobile || ''}</View>
            </View>
            <View className="ava-wrap">
              <Image className="image" mode="scaleToFill" src={userInfo.avatarUrl} />
            </View>
          </View>
        )}
        <Form reportSubmit onSubmit={this.getFormId}>
          <View className="divsion" />
          <View className="h4">我自己的订单</View>
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

          {userInfo.cshopId && (
            <View>
              <View className="divsion" />
              <View className="h4">管理我的门店</View>
              <View className="operate-wrap">
                <Button className="li plain" plain onClick={this.scanCode}>
                  <Text className="erduufont ed-saoyisao" />
                  扫码核销
                </Button>
                <Button
                  className="li plain"
                  plain
                  onClick={this.nextPage.bind(this, '/pages/ucenter/checkRecord')}
                >
                  <Text className="erduufont ed-dingdan" />
                  核销列表
                </Button>
                <Button
                  className="li plain"
                  plain
                  onClick={this.nextPage.bind(this, '/pages/shop/index?id=' + userInfo.cshopId)}
                >
                  <Text className="erduufont ed-dianpu" />
                  查看门店
                </Button>
                <Button
                  className="li plain"
                  plain
                  onClick={this.nextPage.bind(this, '/pages/ucenter/shopUser')}
                >
                  <Text className="erduufont ed-chengyuan" />
                  成员管理
                </Button>
              </View>
            </View>
          )}
          {userInfo.isColonel ? (
            <View>
              <View className="divsion" />
              <View className="ul">
                <AtList>
                  <Button className="li plain" plain onClick={this.nextMini}>
                    <AtListItem arrow="right" title="管理我的小区" />
                  </Button>
                </AtList>
              </View>
            </View>
          ) : (
            <View>
              <View className="divsion" />
              <View className="ul">
                {userInfo.roleId >= 0 && (
                  <AtList>
                    <Button
                      className="li plain"
                      plain
                      onClick={this.nextPage.bind(this, '/pages/deliver/index')}
                    >
                      <AtListItem arrow="right" title="配送路线" />
                    </Button>
                  </AtList>
                )}
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
                onClick={this.nextPage.bind(this, '/pages/account/index')}
              >
                <AtListItem
                  className="em"
                  arrow="right"
                  extraText={'￥' + (accountInfo ? accountInfo.totalMoney || 0 : 0) + '元'}
                  title="我的余额"
                />
              </Button>
              <Button
                className="li plain"
                plain
                onClick={this.nextPage.bind(this, '/pages/goods/index?id=303&p=1')}
              >
                <AtListItem className="em" arrow="right" title="测试连接" />
              </Button>
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
              <Button
                className="li plain"
                formType="submit"
                plain
                onClick={this.nextPage.bind(this, '/pages/ucenter/card')}
              >
                <AtListItem arrow="right" title="我的卡券" />
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
              <Button
                className="li plain"
                formType="submit"
                plain
                onClick={this.nextPage.bind(this, '/pages/pickup/index')}
              >
                <AtListItem arrow="right" title="商铺门店入驻" />
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

        <AtModal isOpened={open}>
          <AtModalHeader>{cardInfo.used_time ? '该二维码已被核销' : '确认核销？'}</AtModalHeader>
          <AtModalContent>
            <View className="check-record">
              <View className="top">
                <View className="user">
                  <AtAvatar size="small" circle image={cardInfo.userInfo.avatarUrl} />
                  <View>
                    <View className="nick">{cardInfo.userInfo.nickName}</View>
                    <View className="nick">{cardInfo.userInfo.mobile}</View>
                  </View>
                </View>
              </View>
              <Product item={cardInfo} />
            </View>
          </AtModalContent>
          {!cardInfo.used_time ? (
            <AtModalAction>
              <Button onClick={this.cancel.bind(this)}>取消</Button>
              <Button onClick={this.sure.bind(this)}>确定</Button>
            </AtModalAction>
          ) : (
            <AtModalAction>
              <Button onClick={this.cancel.bind(this)}>关闭</Button>
            </AtModalAction>
          )}
        </AtModal>
      </View>
    );
  }
}
export default Ucenter as ComponentClass<PageOwnProps, PageState>;
