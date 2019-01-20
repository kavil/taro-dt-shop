import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Checkbox } from '@tarojs/components';
import './checkItemComponent.scss';
import { AtCheckbox } from 'taro-ui';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
}

interface PageOwnProps {
  //父组件要传
  value: any;
  checked?: boolean;
  label?: string;
  onChange?: Function;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;

class CheckItem extends Component<IProps, {}> {
  componentDidMount() {
    if (this.props.checked) {
      this.setState({ checkedAt: [this.props.value] });
    }
  }

  handleCheck = e => {
    if (this.props.onChange) this.props.onChange(e[0] || null);
    this.setState({
      checkedAt: this.state.checkedAt.length ? [] : [this.props.value],
    });
  };

  state = { checkedAt: [] };

  render() {
    const { value, label } = this.props;
    const { checkedAt } = this.state;

    return (
      <View className="check-item">
        <AtCheckbox
          options={[{ value, label: label || '' }]}
          selectedList={checkedAt}
          onChange={this.handleCheck}
        />
      </View>
    );
  }
}

export default CheckItem as ComponentClass<PageOwnProps, PageState>;
