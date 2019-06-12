import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Input, Button, Text, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
  getcodeInfo: any;
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ pickup }) => ({
  ...pickup,
}))
class Pickup extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '加入门店',
  };

  componentDidMount() {}

  onInput(e) {
    let code = e.detail.value;
    this.setState({ code });
    return code;
  }

  async onConfirm() {
    const res = await this.props.dispatch({
      type: 'pickup/getcodeInfo',
      payload: {
        getcode: this.state.code,
      },
    });
    if (res) {
      this.setState({
        open: true,
      });
    }
  }

  cancel() {
    this.setState({
      open: false,
    });
  }

  async sure() {
    this.setState({
      loading: true,
      open: false,
    });

    const res = await this.props.dispatch({
      type: 'pickup/getcodeUse',
      payload: {
        getcode: this.state.code,
      },
    });
    this.setState({
      loading: false,
    });
    if (res) {
      await Taro.showModal({
        title: '提示',
        content: '加入成功',
        showCancel: false,
      });
      await this.props.dispatch({
        type: 'common/UserInfo',
      });
      Taro.navigateBack();
    }
  }

  state = {
    code: undefined,
    loading: false,
    open: false,
  };

  props: any = {
    getcodeInfo: {},
  };

  render() {
    const { getcodeInfo } = this.props;
    const { code, open, loading } = this.state;
    return (
      <View className="pickup-page">
        <View className="pad40 h1">
          加入店铺<View className="p">新门店需要联系工作人员18503050275入驻，获得邀请码</View>
        </View>
        <View className="code-wrap pad40 tac">
          <Input
            className="input"
            maxLength={4}
            type="digit"
            onInput={this.onInput}
            value={code}
            focus
            confirmHold
          />
          <View className="p">请输入4位店铺邀请码</View>
        </View>
        <View className="pad40">
          <AtButton
            onClick={this.onConfirm.bind(this, code)}
            loading={loading}
            disabled={loading}
            type="primary"
          >
            确定
          </AtButton>
        </View>

        <AtModal isOpened={open}>
          <AtModalHeader>
            {getcodeInfo.getcodeStatus ? '确认加入该门店' : '该邀请码已失效'}
          </AtModalHeader>
          <AtModalContent>
            <View>{getcodeInfo.shop.name}</View>
            <View className="fj">
              <View className="img-wrap">
                <Image lazyLoad className="img" src={getcodeInfo.shop.avatar + '@!750X500'} />
              </View>
              <View className="li">
                <View className="left">
                  <Text className="erduufont ed-location" />
                  {getcodeInfo.shop.address}
                </View>
              </View>
              <View className="li">
                <View className="left">
                  <Text className="erduufont ed-dianhua" />
                  {getcodeInfo.shop.phone}
                </View>
              </View>
            </View>
          </AtModalContent>
          {getcodeInfo.getcodeStatus ? (
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
export default Pickup as ComponentClass<PageOwnProps, PageState>;
