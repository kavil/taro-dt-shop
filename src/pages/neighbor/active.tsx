import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text, Image, RichText } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import Login from '../../components/login/loginComponent';
import './index.scss';

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
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ neighbor, common }) => ({
  ...neighbor,
  ...common,
}))
class Active extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '邻居圈',
  };

  async componentDidShow() {}
  async onPullDownRefresh() {
    await this.componentDidShow();
    Taro.stopPullDownRefresh();
  }

  loginSuccess = async _ => {
    this.componentDidShow();
  };

  state = {
    userInfo: {},
  };

  render() {
    const {} = this.props;
    const { userInfo }: any = this.state;

    return (
      <View className="neighbor-page">
        <Login show={false} onChange={this.loginSuccess} />
        <View className="active-con">
          <View className="img-wrap">
            <Image
              lazyLoad
              mode="widthFix"
              className="img"
              src={'https://img.kavil.com.cn/images/nba/2019318214042TjBnxRbx.png@!900X383'}
            />
          </View>
          <View className="something">goods-item</View>
          {/* <View className="selledUsers">
            {selledUsers.data.map((ele, i) => (
              <Image key={i} className="image" src={ele.userInfo.avatarUrl} />
            ))}
            <Text className="text">等刚刚助力</Text>
          </View>
          <View className="h3">商品详情</View>
          <RichText nodes={detailNodes} onClick={this.clickDetail.bind(this)} /> */}
        </View>
      </View>
    );
  }
}
export default Active as ComponentClass<PageOwnProps, PageState>;
