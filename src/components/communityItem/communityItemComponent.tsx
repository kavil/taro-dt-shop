import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './communityItemComponent.scss';
import { AtButton, AtAvatar } from 'taro-ui';
import { connect } from '@tarojs/redux';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
}

interface PageOwnProps {
  //父组件要传
  item: any;
  onChange: Function;
  noApply?: boolean;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;
@connect(({ neighbor, common }) => ({
  ...common,
  ...neighbor,
}))
class CommunityItem extends Component<IProps, {}> {
  bind = async () => {
    const res = await this.props.dispatch({
      type: 'neighbor/Bind',
      payload: {
        ...this.props.item,
      },
    });
    await this.props.dispatch({
      type: 'common/UserInfo',
    });
    if (res) this.props.onChange('bind ok');
  };
  apply = async () => {
    const res = await this.props.dispatch({
      type: 'neighbor/Bind',
      payload: {
        ...this.props.item,
      },
    });
    await this.props.dispatch({
      type: 'common/UserInfo',
    });
    if (res) Taro.navigateTo({ url: '/pages/coloneApply/index' });
  };

  state = {};

  render() {
    const { item, noApply } = this.props;
    const {} = this.state;

    return (
      <View className="community-item">
        <View className="info">
          <View className="left">
            <View className="h4">{item.name}</View>
            <View className="p">{item.address}</View>
          </View>
          <View className="right">
            {item.colonel && item.colonel.id ? (
              <View className="colonel-wrap">
                <View className="badge">小区长</View>
                <View className="colonel">
                  <AtAvatar circle size="small" image={item.colonel.avatarUrl} />
                  <View className="name">{item.colonel.nickName}</View>
                </View>
              </View>
            ) : (
              <View className="colonel-wrap">
                {!noApply && (
                  <View className="colonel">
                    <AtButton type="secondary" circle size="small" onClick={this.apply}>
                      <Text className="main-color">申请</Text>
                    </AtButton>
                    <View className="name">暂无团长</View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        <View className="op">
          <AtButton type="primary" circle size="small" onClick={this.bind}>
            <Text className="white">绑定</Text>
          </AtButton>
        </View>
      </View>
    );
  }
}

export default CommunityItem as ComponentClass<PageOwnProps, PageState>;
