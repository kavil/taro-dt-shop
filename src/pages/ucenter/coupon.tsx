import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import './coupon.scss';
import { AtTag, AtButton } from 'taro-ui';
import { tip, getTime } from '../../utils/tool';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  couponList: any[];
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ ucenter }) => ({
  ...ucenter,
}))
class Coupon extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '我的红包',
  };

  async componentDidMount() {
    await this.props.dispatch({
      type: 'ucenter/Coupon',
    });
  }
  async onPullDownRefresh() {
    await this.componentDidMount();
    Taro.stopPullDownRefresh();
  }
  useIt = async ele => {
    if (!this.$router.params.type) return;
    const now = getTime();
    if (getTime(ele.info.use_start_date) > now || getTime(ele.info.use_end_date) < now) {
      tip('已过期');
      return;
    }
    await this.props.dispatch({
      type: 'cart/save',
      payload: {
        couponId: ele.coupon_id,
      },
    });
    Taro.navigateBack();
  };
  unUse = async () => {
    if (!this.$router.params.type) return;

    await this.props.dispatch({
      type: 'cart/save',
      payload: {
        couponId: 0,
      },
    });
    Taro.navigateBack();
  };

  render() {
    const { couponList } = this.props;
    const type = this.$router.params.type;
    const classText = ele => {
      const now = getTime();
      let res = 'cli';
      if (getTime(ele.use_start_date) > now || getTime(ele.use_end_date) < now) {
        res = 'cli disabled';
      }
      return res;
    };
    return (
      <View className="coupon-page">
        <View className="coupon-ul">
          {couponList && couponList.length ? (
            couponList.map((ele, i) => (
              <View key={i} className={classText(ele.info)} onClick={this.useIt.bind(this, ele)}>
                <View className="cicle l" />
                <View className="cicle r" />
                <View className="top">
                  <View className="left">
                    <View className="money">
                      {ele.info.type_money}
                      <Text className="mini">元</Text>
                    </View>
                    <View className="p">满{ele.info.min_amount}元可用</View>
                  </View>
                  <View className="right">
                    <View className="name">{ele.info.name}</View>
                    {classText(ele.info) === 'cli disabled' && (
                      <AtTag active={true} size="small" circle>
                        {getTime(ele.info.use_start_date) > getTime() ? '还未开始' : '已过期'}
                      </AtTag>
                    )}
                  </View>
                </View>
                <View className="bottom p">
                  有效期：{ele.info.use_start_date} ~ {ele.info.use_end_date || '无限制'}
                </View>
              </View>
            ))
          ) : (
            <View className="nodata">
              <Text className="erduufont ed-zanwushuju" />
              <View className="label">暂无数据</View>
            </View>
          )}
        </View>

        {type && (
          <View className="pad40">
            <AtButton type="primary" onClick={this.unUse}>
              不使用红包
            </AtButton>
          </View>
        )}
      </View>
    );
  }
}
export default Coupon as ComponentClass<PageOwnProps, PageState>;
