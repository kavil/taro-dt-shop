import Taro, { Component } from '@tarojs/taro';
import { ComponentClass } from 'react';
import { View, Map, Text, Button } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.scss';
import { AtButton, AtCalendar, AtModalHeader, AtModalContent, AtModalAction, AtModal, AtRadio } from 'taro-ui';
import { getLocalTime, getTime, getTextTime } from '../../utils/tool';
import posiImg1 from '../../static/images/posi1.png';
import posiImg2 from '../../static/images/posi2.png';
import posiImg0 from '../../static/images/posi0.png';

type PageState = {};
interface PageDvaProps {
  dispatch: Function;
}

interface PageOwnProps {
  //父组件要传
}
interface PageStateProps {
  // 自己要用的
  markers: any[];
  polyline: any[];
}
type IProps = PageStateProps & PageDvaProps & PageOwnProps;

@connect(({ deliver, loading }) => ({
  ...deliver
}))
class Deliver extends Component<IProps, {}> {
  config = {
    navigationBarTitleText: '智能配送路线'
  };

  async componentDidMount() {
    this.setState({
      startTmp: getTextTime(getTime() - 86400000 * 2).split(' ')[0] + ' 23:59:59',
      endTmp: getTextTime(getTime() - 86400000 * 1).split(' ')[0] + ' 23:59:59'
    });

    // 获取地理位置
    let local;
    try {
      local = await Taro.getLocation({ type: 'wgs84' });
      this.setState({ localSetting: true });
    } catch (error) {
      this.setState({ localSetting: false });
    }
    // 默认附近小区
    if (local) {
      await this.computer();
      this.setState({ local });
    }
  }

  openSetting = async () => {
    const { errMsg }: any = await Taro.openSetting();
    console.log(errMsg);

    if (errMsg === 'openSetting:ok') this.componentDidMount();
  };

  makePhoneCall() {
    const { curMarker }: any = this.state;
    Taro.makePhoneCall({ phoneNumber: curMarker.mobile });
  }
  navMap() {
    const { curMarker }: any = this.state;
    Taro.openLocation({
      latitude: curMarker.latitude,
      longitude: curMarker.longitude,
      name: curMarker.title
    });
  }

  openDateFun = async () => {
    this.setState({
      openDate: true
    });
  };
  changeDate = async (e) => {
    this.setState({
      start: getTextTime(e.value.start).split(' ')[0] + ' 23:59:59',
      end: getTextTime(e.value.end).split(' ')[0] + ' 23:59:59'
    });
  };
  closeDate = async (e) => {
    await this.computer();
    this.setState({
      openDate: false
    });
  };

  async computer() {
    const deliverCommunity = await this.props.dispatch({
      type: 'deliver/Community',
      payload: {
        startTime: this.state.start,
        endTime: this.state.end
      }
    });

    const markers = deliverCommunity.map((ele) => {
      return {
        id: ele.id,
        title: ele.name + (ele.colonel.house ? '·' + ele.colonel.house : ''),
        latitude: ele.lat,
        longitude: ele.lng,
        iconPath: this.state.posiImg[ele.line],
        width: 30,
        height: 30,
        line: ele.line,
        mobile: ele.colonelMobile,
        callout: {
          content: (ele.colonel.house ? '·' + ele.colonel.house : '') + '·' + ele.colonelMobile,
          borderColor: '#1fa0ff',
          padding: 3,
          borderRadius: 5,
          fontSize: 12,
          borderWidth: 1
        },
        label: {
          content: ele.name,
          borderColor: '#1fa0ff',
          padding: 1,
          borderRadius: 2,
          fontSize: 10,
          borderWidth: 1,
          bgColor: '#ffffff',
          anchorX: -20
        }
      };
    });

    // const points = deliverCommunity.map(ele => {
    //   return {
    //     latitude: ele.lat,
    //     longitude: ele.lng,
    //   };
    // });
    // const polyline = [
    //   {
    //     points,
    //     color: '#FF0000DD',
    //     width: 2,
    //     dottedLine: true,
    //   },
    // ];

    // console.log(polyline, 'polyline');

    this.setState({ markers });
  }

  markerTap = async (e) => {
    console.log(e);
    const { markers }: any = this.state;
    const curMarker = markers.find((ele) => ele.id === e.markerId);

    this.setState({ curMarker });
  };

  handleRadio = async (e) => {
    console.log(e);
    const line = Number(e);
    const { curMarker }: any = this.state;
    const res = await this.props.dispatch({
      type: 'deliver/Setline',
      payload: {
        communityId: curMarker.id,
        line
      }
    });
    if (!res) return;
    const { markers, posiImg }: any = this.state;
    markers.forEach((ele) => {
      if (ele.id === curMarker.id) {
        ele.line = line;
        ele.iconPath = posiImg[line];
      }
    });

    this.setState({
      curMarker: { ...curMarker, line, iconPath: posiImg[line] },
      markers: [...markers]
    });
  };

  showLineFun = () => {
    this.setState({ showLine: !this.state.showLine });
  };

  state = {
    localSetting: true,
    local: {},
    openDate: false,
    start: getTextTime(getTime() - 86400000 * 2).split(' ')[0] + ' 23:59:59',
    end: getTextTime(getTime() - 86400000 * 1).split(' ')[0] + ' 23:59:59',
    markers: [],
    polyline: [],
    curMarker: null,
    posiImg: [null, posiImg1, posiImg2],
    showLine: false
  };

  render() {
    const {} = this.props;
    const { localSetting, local, start, end, openDate, startTmp, endTmp, markers, polyline, curMarker, showLine }: any = this.state;
    return (
      <View className="deliver-page">
        {openDate && (
          <AtModal isOpened={openDate} closeOnClickOverlay={false}>
            <AtModalHeader>选择日期区间</AtModalHeader>
            <AtModalContent>
              <AtCalendar
                isMultiSelect
                marks={[{ value: getLocalTime() }]}
                currentDate={{ start: startTmp, end: endTmp }}
                onSelectDate={this.changeDate}
              />
            </AtModalContent>
            <AtModalAction>
              <Button type="primary" onClick={this.closeDate}>
                确定
              </Button>
            </AtModalAction>
          </AtModal>
        )}

        {!openDate && (
          <Map
            className="deliver-page"
            id="myaMap"
            style="width: 100%; height: 500px;"
            longitude={local.longitude}
            latitude={local.latitude}
            markers={markers}
            polyline={polyline}
            showLocation={true}
            onMarkerTap={this.markerTap.bind(this)}
          />
        )}
        <View className="label" onClick={this.openDateFun}>
          时间：{start} ~{end}
          <AtButton type="secondary" size="small" className="bt" onClick={this.openDateFun}>
            更改
          </AtButton>
        </View>
        <View className="map-op">
          {curMarker && (
            <View className="cur-map">
              当前选中：{curMarker.title}
              {showLine && (
                <AtRadio
                  options={[
                    { label: '设为大货车线路', value: 1 },
                    { label: '设为三轮车线路', value: 2 }
                  ]}
                  value={curMarker.line}
                  onClick={this.handleRadio.bind(this)}
                />
              )}
              <View className="bts">
                <AtButton type="primary" size="small" className="bt" onClick={this.showLineFun}>
                  路线设置
                </AtButton>
                <AtButton type="primary" size="small" className="bt" onClick={this.makePhoneCall}>
                  电话
                </AtButton>
                <AtButton type="primary" size="small" className="bt" onClick={this.navMap}>
                  导航
                </AtButton>
              </View>
            </View>
          )}
        </View>

        {!localSetting && (
          <View className="pad20 pt">
            <AtButton type="primary" onClick={this.openSetting}>
              <Text className="white">打开位置权限</Text>
            </AtButton>
            <View className="p">需要获取您的位置信息查找附近小区</View>
          </View>
        )}
      </View>
    );
  }
}
export default Deliver as ComponentClass<PageOwnProps, PageState>;
