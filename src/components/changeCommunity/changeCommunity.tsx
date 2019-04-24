import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { Form, Button } from '@tarojs/components';
import { AtModal, AtModalContent, AtModalAction } from 'taro-ui';
import './changeCommunity.scss';
import CommunityItem from '../communityItem/communityItemComponent';
import { tip } from '../../utils/tool';

interface PageState {}
interface PageDva {
  dispatch: Function;
}

interface PageStateProps {
  // 自己要用的
  userInfo: any;
  formIdArr: any;
}

interface PageOwnProps {
  //父组件要传
  show: boolean;
  onChange?: Function;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;
@connect(({ common, neighber }) => ({
  ...common,
  ...neighber,
}))
class ChangeCommunity extends Component<IProps, {}> {
  async componentDidMount() {
    const changeCids = Taro.getStorageSync('changeCids');
    const ids = changeCids ? changeCids.split(',') : [];
    Taro.removeStorageSync('changeCids');
    if (ids.length) {
      const communityList = await this.props.dispatch({
        type: 'neighbor/ids',
        payload: { ids },
      });
      this.setState({ communityList, openCo: true });
      console.log(ids, communityList, 'ChangeCommunity');
    }
  }
  componentWillUnmount() {
    this.setState({
      openCo: false,
    });
  }

  changeFun = async id => {
    this.setState({
      openCo: false,
    });
    tip('绑定成功');
    if (this.props.onChange) this.props.onChange(id);
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
  close = () => {
    this.setState({
      openCo: false,
    });
  };
  state = {
    openCo: false,
    communityList: [],
  };

  render() {
    const { openCo, communityList }: any = this.state;

    return (
      <Form reportSubmit onSubmit={this.getFormId}>
        <AtModal isOpened={openCo}>
          <AtModalContent>
            检测到您目前绑定的是【{communityList[0].name}】，点击绑定按钮确定切换小区作为新代收点
            {communityList.map((ele, i) => {
              return i > 0 ? (
                <CommunityItem
                  key={ele.id}
                  item={ele}
                  noApply={true}
                  onChange={this.changeFun.bind(this, ele)}
                />
              ) : null;
            })}
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.close}>不更换</Button>
          </AtModalAction>
        </AtModal>
      </Form>
    );
  }
}

export default ChangeCommunity as ComponentClass<PageOwnProps, PageState>;
