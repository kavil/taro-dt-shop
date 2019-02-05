import Taro, { Component } from '@tarojs/taro';
import { View, Text, Picker } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtDivider } from 'taro-ui';
import './score.scss';

interface DispatchOption {
  type?: string;
  payload?: Object;
}

type PageStateProps = {};

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any;
};

type PageOwnProps = {
  scoreList?: any;
  opType: number;
  page: number;
  loadOver: boolean;
};

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

@connect(({ score }) => ({
  ...score,
}))
export default class List extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '我的积分明细',
  };

  componentDidMount = () => {
    this.getAccountList();
  };

  getAccountList() {
    this.props.dispatch({
      type: 'score/ScoreList',
    });
  }

  async changeType(event) {
    const opType = event.detail.value;
    console.log(opType);
    await this.props.dispatch({
      type: 'score/save',
      payload: {
        opType,
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      },
    });
    this.getAccountList();
  }

  async onPullDownRefresh() {
    await this.props.dispatch({
      type: 'score/save',
      payload: {
        page: 1, // 归位
        refresh: true,
        loadOver: false,
      },
    });
    this.getAccountList();
  }
  async onReachBottom() {
    await this.props.dispatch({
      type: 'score/save',
      payload: {
        page: this.props.page + 1,
      },
    });
    this.getAccountList();
  }
  nextPage(url) {
    Taro.navigateTo({
      url: url,
    });
  }

  typeRange = ['全部类型', '增加', '减少'];

  render() {
    const { scoreList, loadOver, opType } = this.props;
    return (
      <View className="score-page">
        <Picker
          className="pick"
          mode="selector"
          range={this.typeRange}
          value={opType}
          onChange={this.changeType.bind(this)}
        >
          {this.typeRange[opType]}
          <Text className="erduufont ed-back down" />
        </Picker>
        {scoreList && scoreList.length ? (
          <View className="base-ul">
            {scoreList.map(item => {
              return (
                <View
                  key={item.id}
                  className="li"
                  onClick={this.nextPage.bind(this, `./detail?id=${item.id}`)}
                >
                  <View className="left">
                    <View className="h2">
                      {item.orderId == 0 ? item.note : '订单号 ' + item.orderId}
                    </View>
                    <View className="type">[{this.typeRange[item.opType]}]</View>
                    <View className="time">{item.createdTime}</View>
                  </View>
                  <View className="right">
                    {item.score < 0 ? (
                      <View className="money green">{item.score}</View>
                    ) : (
                      <View className="money yellow">+{item.score}</View>
                    )}
                    <View className="type">剩余 {item.totalScore}</View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="nodata">
            <Text className="erduufont ed-zanwushuju" />
            <View className="label">暂无数据</View>
          </View>
        )}
        {loadOver && scoreList && scoreList.length && (
          <View className="pad40">
            <AtDivider content="没有更多了" fontSize="24" fontColor="#ddd" lineColor="#ddd" />
          </View>
        )}
      </View>
    );
  }
}
