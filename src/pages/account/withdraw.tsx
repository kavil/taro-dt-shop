import Taro, { Component } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AtButton, AtModal } from 'taro-ui'
import './index.scss';


interface DispatchOption {
  type?: string,
  payload?: Object,
}

type PageStateProps = {
}

type PageDispatchProps = {
  dispatch: (option: DispatchOption) => any,
}

type PageOwnProps = {
  accountInfo?: any,
}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ account }) => ({
  ...account,
}))
export default class Withdraw extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '提现',
  };

  componentDidMount = () => {

  };

  quickAll(myMoney) {
    this.setState({
      getMoney: myMoney
    })
  }

  onInput(e) {
    let getMoney = e.detail.value;
    if (getMoney / 1 > this.state.myMoney) {
      getMoney = this.state.myMoney;
    }
    console.log(getMoney, this.state.myMoney);
    this.setState({ getMoney })
  }

  async onConfirm() {
    console.log(this.state.getMoney);
    this.setState({
      getMoney: Number(this.state.getMoney).toFixed(2)
    })
    if (!this.state.getMoney) {
      Taro.showToast({ title: '请填写正确金额', icon: 'none' });
      return;
    }

    this.setState({
      open: true,
    })

  }

  async sure() {
    this.setState({
      loading: true,
      open: false,
    })

    const errno = await this.props.dispatch({
      type: 'account/withdraw',
      payload: {
        account: this.state.getMoney
      }
    })
    this.setState({
      loading: false,
    })
    if (errno == 0) {
      await Taro.showModal({
        title: '提示',
        content: '提现成功，请查收微信零钱',
        showCancel: false,
      })
      Taro.navigateBack();
    }
  }
  cancel() {
    this.setState({
      open: false,
    })
  }

  state = {
    getMoney: undefined,
    loading: false,
    open: false,
    myMoney: this.props.accountInfo ? (this.props.accountInfo.totalAccount - this.props.accountInfo.sumAccountHold).toFixed(2) : 0
  }
  render() {
    // const { accountInfo } = this.props;
    return (
      <View className="account-page withdraw">
        <View className="op-ul big">
          <View className="li">
            <Text className='erduufont ed-lingqian pre-icon green'></Text>
            <Text className='label'>提现至微信零钱</Text>
          </View>
        </View>
        <View className="wd-box">
          <View className="p">提现金额（免服务费）</View>
          <View className='input-money'>
            <Text className='label'>￥</Text>
            <Input className='input' type="digit" onInput={this.onInput} value={this.state.getMoney} focus confirmHold />
          </View>
          <View className="wd-down">
            <Text className='info'>可提现金额{this.state.myMoney}</Text>
            <Text className='blue' onClick={this.quickAll.bind(this, this.state.myMoney)}>全部提现</Text>
          </View>
        </View>
        <View className="pad40"><AtButton onClick={this.onConfirm} loading={this.state.loading} disabled={this.state.loading} type='primary'>确定</AtButton></View>

        <AtModal
          isOpened={this.state.open}
          title='提示'
          cancelText='取消'
          confirmText='确认'
          onCancel={this.cancel}
          onConfirm={this.sure}
          content={'确定提现 ' + this.state.getMoney + '元'}
        />
      </View>
    )
  }
}
