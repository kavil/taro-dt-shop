import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';

@connect(({community}) => ({
  ...community,
}))
export default class Community extends Component {
  config = {
    navigationBarTitleText: 'community',
  };

  componentDidMount() {

  };

  render() {
    return (
      <View className="community-page">
        小区地址修改
        我的名称修改
        我的手机号修改
        
      </View>
    )
  }
}
