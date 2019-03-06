import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import communityImg from '../../static/images/community.png';
import colonelapplyImg from '../../static/images/colonelapply.jpg';
import { AtForm, AtInput, AtButton, AtImagePicker } from 'taro-ui';
import { tip } from '../../utils/tool';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
  loading: boolean;
  userInfo: any;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ colonel, loading, common }) => ({
  ...colonel,
  ...common,
  loading: loading.effects['colonel/Apply'],
  getPhoneLoading: loading.effects['common/login'],
}))
class Colonelapply extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '小区长申请',
  };

  async componentDidMount() {
    const parentId = this.$router.params.id || 26;
    console.log(parentId, 'parentId'); // 此处是userId
    
    if (parentId && parentId !== this.props.userInfo.id) {
      const res = await this.props.dispatch({
        type: 'colonel/User',
        payload: { id: parentId },
      });
      if (res.errno !== 0) return;
      this.setState({
        parent: res.data,
      });
    }
    await this.props.dispatch({
      type: 'common/wxCode',
    });
    const cfg = await this.props.dispatch({
      type: 'common/UploadSign',
    });
    this.setState({
      uploadHeaders: cfg,
    });
  }
  onSubmit = async () => {
    const fm: any = this.state.formModel;
    if (!fm.mobile) {
      tip('请同步手机号！');
      return;
    }
    if (!this.props.userInfo.communityId) {
      tip('请绑定小区！');
      return;
    }
    if (!fm.house) {
      tip('请填写详细楼栋！');
      return;
    }
    if (!fm.images.length) {
      tip('请上传身份证！');
      return;
    }
    if (!fm.realName) {
      tip('请填写姓名！');
      return;
    }
    console.log(fm);
    const res = await this.props.dispatch({
      type: 'colonel/Apply',
      payload: { ...fm, images: fm.images.map(res => res.url).join(','), parent: this.state.parent['id'] },
    });
    if (res) {
      const modal = await Taro.showModal({
        title: '提示',
        content: '提交成功，请注意接听来电',
        showCancel: false,
      });
      if (modal.confirm) {
        Taro.navigateBack();
      }
    }
  };
  handleInput = async (label, value) => {
    console.log(label, value);
    const { formModel, uploadHeaders }: any = this.state;

    if (label === 'images') {
      for (let i = 0; i < value.length; i++) {
        const filePath = value[i].url;
        if (filePath.includes('img.kavil.com.cn')) continue;
        const aliyunFileKey =
          'dtshop' +
          filePath
            .replace(/wxfile:\/\/[^\.]*.[^\.]*\./, '')
            .replace(/http:\/\/[^\.]*.[^\.]*\./, '');
        const res = await Taro.uploadFile({
          url: uploadHeaders.host,
          filePath,
          name: 'file', //必须填file
          formData: {
            key: aliyunFileKey,
            policy: uploadHeaders.policy,
            OSSAccessKeyId: uploadHeaders.OSSAccessKeyId,
            signature: uploadHeaders.signature,
            success_action_status: '200',
          },
        });
        if (res.statusCode != 200) {
          tip('上传失败，请重试');
          return;
        }
        value[i].url = uploadHeaders.host + '/' + aliyunFileKey;
        console.log('上传图片成功', value);
      }
    }
    formModel[label] = value;
    this.setState({
      formModel: { ...formModel },
    });
  };
  nextPage = url => {
    Taro.navigateTo({ url });
  };
  lookBig = img => {
    console.log(img);
    Taro.previewImage({
      current: img + '@!q90',
      urls: [img + '@!q90'],
    });
  };

  getPhone = async event => {
    if (event.detail.errMsg !== 'getPhoneNumber:ok') {
      tip('获取手机号失败');
      return;
    }
    const res = await this.props.dispatch({
      type: 'common/BindPhone',
      payload: {
        encryptedData: event.detail.encryptedData,
        iv: event.detail.iv,
      },
    });
    if (res.errno === 0) {
      this.setState({ formModel: { ...this.state.formModel, mobile: res.data } });
    }
  };

  nullChange = () => {};

  onShareAppMessage() {
    return {
      title: this.props.userInfo.nickName + '喊你申请小区长',
      path: `/pages/colonelApply/index?id=${this.props.userInfo.id}`,
    };
  }
  state = {
    formModel: {
      images: [],
    },
    uploadHeaders: null,
    getPhoneLoading: false,
    parent: {},
  };

  render() {
    const { loading, userInfo } = this.props;
    const { formModel, getPhoneLoading, parent }: any = this.state;
    return (
      <View className="apply-page">
        <Image className="apply-img" src={colonelapplyImg} />
        <View className="pad40 h2">
          小区长申请表
          <View className="p">
            小区长是联系小区用户和新邻居平台的纽带，是有编制无约束的新合作模式。
          </View>
        </View>
        <View className="pad40">
          <View className="ava-wrap">
            <Image className="img" src={userInfo.avatarUrl} />
            {userInfo.nickName}
          </View>
          <AtForm onSubmit={this.onSubmit.bind(this)}>
            <View className="form-item">
              <View className="label">手机号</View>
              {!formModel.mobile ? (
                <View className="value">
                  <AtButton
                    type="secondary"
                    loading={getPhoneLoading}
                    disabled={getPhoneLoading}
                    openType="getPhoneNumber"
                    onGetPhoneNumber={this.getPhone}
                  >
                    同步微信手机号
                  </AtButton>
                  <View className="p">请先在你的微信设置中绑定好手机号</View>
                </View>
              ) : (
                <View className="value">{formModel.mobile}</View>
              )}
            </View>

            <View className="form-item">
              <View className="label">城市</View>
              <View className="value">新余市</View>
            </View>

            <View className="form-item">
              <View className="label">申请小区</View>
              <View className="value">
                {userInfo.communityId ? (
                  <View className="community-wrap">
                    <Image src={communityImg} />
                    {userInfo.name}
                    <View className="flex">
                      <AtInput
                        placeholder="我可以提供收货的详细楼栋、门牌号"
                        name="house"
                        value={formModel.house}
                        onChange={this.handleInput.bind(this, 'house')}
                      />
                    </View>
                  </View>
                ) : (
                  <View className="select-addr">
                    <AtButton
                      size="small"
                      type="secondary"
                      onClick={this.nextPage.bind(this, '/pages/neighbor/search?noApply=true')}
                    >
                      绑定小区
                    </AtButton>
                  </View>
                )}
              </View>

              {userInfo.communityId && (
                <View className="ex">
                  <AtButton
                    type="secondary"
                    size="small"
                    onClick={this.nextPage.bind(this, '/pages/neighbor/search?noApply=true')}
                  >
                    更换
                  </AtButton>
                </View>
              )}
            </View>

            <View className="form-item">
              <View className="label">身份证正、反面</View>
              <View className="value">
                <AtImagePicker
                  multiple
                  length={2}
                  showAddBtn={formModel.images.length < 2}
                  files={formModel.images}
                  onChange={this.handleInput.bind(this, 'images')}
                  onImageClick={this.lookBig.bind(this)}
                />
                <View className="p">仅用于审核，不会公开</View>
              </View>
            </View>
            <AtInput
              name="realName"
              title="姓名"
              type="text"
              placeholder="请填写真实姓名"
              value={formModel.realName}
              onChange={this.handleInput.bind(this, 'realName')}
            />

            <AtInput
              name="content"
              title="补充说明"
              type="text"
              placeholder="已经有小区群、群人数；可以提供暂存小仓库等等"
              value={formModel.content}
              onChange={this.handleInput.bind(this, 'content')}
            />

            {parent.id && (
              <View className="form-item">
                <View className="label">我的推荐人</View>
                <View className="value">
                  <Image className="ava" src={parent.avatarUrl} />
                  {parent.nickName}·{parent.mobile}
                </View>
              </View>
            )}

            <View className="ptb20">
              <AtButton type="primary" loading={loading} disabled={loading} formType="submit">
                提交
              </AtButton>
            </View>
            <View className="p">请保持手机畅通，提交后我们将在12小时内审核并回电</View>
          </AtForm>
          {/* <View className="p ptb20">
            请仔细填写完整，审核通过后需要缴纳<Text className="b">1500元</Text>保证金，其中
            <Text className="b">1000元</Text>
            可以在解约小区长时随时退，<Text className="b">500元</Text>
            将会返还充值在新邻居平台，可用于平台各种消费。
          </View> */}
        </View>
      </View>
    );
  }
}
export default Colonelapply as ComponentClass<PageOwnProps, PageState>;
