import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtList, AtListItem } from 'taro-ui';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
  accountInfo?: any;
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ account, loading }) => ({
  ...account,
}))
class Account extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '我的可用余额',
  };

  componentDidMount = () => {};
  onPullDownRefresh() {
    Taro.stopPullDownRefresh();
  }
  nextPage(url) {
    Taro.navigateTo({ url });
  }

  state = {};

  render() {
    const { accountInfo } = this.props;
    console.log(accountInfo);
    
    return (
      <View className="account-page">
        <View className="account-top">
          <Text className="tip">余额账户(元)</Text>
          <View className="yue">{accountInfo.totalMoney}</View>
        </View>
        <View className="account-info">可直接提现，每次最低提现1元，每天最多三次。</View>

        <AtList>
          <AtListItem
            onClick={this.nextPage.bind(this, '/pages/account/withdraw')}
            title="提现"
            arrow="right"
            extraText="免服务费"
            iconInfo={{ size: 25, value: ' erduufont ed-tixian blue' }}
          />
          <AtListItem
            onClick={this.nextPage.bind(this, '/pages/account/list')}
            title="明细"
            arrow="right"
            iconInfo={{ size: 25, value: ' erduufont ed-mingxi yellow' }}
          />
        </AtList>
      </View>
    );
  }
}
export default Account as ComponentClass<PageOwnProps, PageState>;
