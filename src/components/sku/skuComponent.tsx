import { ComponentClass } from 'react';
import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { AtFloatLayout, AtButton } from 'taro-ui';
import './skuComponent.scss';
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
  goods: any;
  onChange: Function;
  onClose: Function;
}

type IProps = PageState & PageOwnProps & PageDva & PageStateProps;
@connect(({ goods }) => ({
  ...goods,
}))
class Sku extends Component<IProps, {}> {
  static defaultProps = {
    goods: {},
  };

  async componentDidMount() {
    const res = await this.props.dispatch({
      type: 'goods/Sku',
      payload: {
        goods_id: this.props.goods.id,
      },
    });
    res.config.forEach(ele => {
      ele.speList = [];
      res.skuList.forEach(sku => {
        sku.specification.map(spe => {
          if (spe.specification_id === ele.id) {
            if (!spe.skuIds) spe.skuIds = [];
            if (ele.speList.map(v => v.value).includes(spe.value)) {
              ele.speList.forEach(v => {
                if (v.value === spe.value) v.skuIds.push(spe.product_id);
              });
            } else {
              ele.speList.push({ ...spe, skuIds: [spe.product_id] });
            }
          }
        });
      });
    });
    console.log(res.config);

    this.setState({
      skuList: res.skuList,
      config: res.config,
      selectedSkuId: res.skuList[0].id,
    });
  }

  clickClose = () => {
    this.setState({ isOpened: false }, () =>
      setTimeout(() => {
        this.onClose();
      })
    );
  };
  onClose = () => {
    this.props.onClose();
  };

  lookBig = img => {
    console.log(img);
    Taro.previewImage({
      current: img + '@!q90',
      urls: [img + '@!q90'],
    });
  };

  selectSpe = spe => {
    console.log(spe);
    if (spe.skuIds.includes(this.state.selectedSkuId)) return;
    this.setState({
      selectedSkuId: spe.product_id,
    });
  };
  ok = () => {
    this.props.onChange({ skuId: this.state.selectedSkuId, goodsId: this.props.goods.id });
    this.onClose();
  };

  state = {
    isOpened: true,
    skuList: [],
    config: [],
    selectedSkuId: null,
  };

  render() {
    const { goods } = this.props;
    const { isOpened, config, selectedSkuId, skuList }: any = this.state;

    const checkHasSkuId = (skuIds, skuIdsMap) => {
      let flag = false;
      skuIds.forEach(ele => {
        if (skuIdsMap.includes(ele)) flag = true;
      });
      return flag;
    };
    const getSpeClass = spe => {
      let className = 'tag';
      let skuIdsMap = [];
      config.forEach(ele => {
        ele.speList.forEach(spe => {
          if (spe.skuIds.includes(selectedSkuId)) {
            skuIdsMap = skuIdsMap.concat(spe.skuIds);
          }
        });
      });
      if (spe.skuIds.includes(selectedSkuId)) {
        className = 'tag active';
      } else {
        if (!checkHasSkuId(spe.skuIds, skuIdsMap)) className = 'tag disabled';
      }
      return className;
    };
    const getSkuResult = skuList.find(ele => ele.id === selectedSkuId);
    if (!getSkuResult) return null;
    const skuResultText = getSkuResult.specification.map(ele => ele.value).join('，');
    return (
      <AtFloatLayout isOpened={isOpened} onClose={this.onClose}>
        <View className="main">
          <Text className="ed-close" onClick={this.clickClose}>
            ×
          </Text>
          <View className="top">
            <View
              className="img-wrap"
              onClick={this.lookBig.bind(this, getSkuResult.specification[0].pic_url)}
            >
              <Image className="img" src={getSkuResult.specification[0].pic_url + '@!300X300'} />
            </View>
            <View>
              <View className="h4">选择规格</View>
              <Text className="p">{skuResultText}</Text>
              <Text className="p">
                库存{getSkuResult.goods_number}
                {goods.goods_unit}
              </Text>
              <View className="price">
                <View className="retail">小区价</View>
                <View className="vip">
                  ￥{getSkuResult.retail_price}
                  <View className="counter">￥{getSkuResult.counter_price}</View>
                  <View className="label">
                    会员{((getSkuResult.vip_price / getSkuResult.retail_price) * 10).toFixed(1)}折
                  </View>
                </View>
              </View>
            </View>
          </View>
          {config.map((ele, i) => (
            <View key={i}>
              <View className="b">{ele.name}</View>
              {ele.speList.map((spe, j) => (
                <View className={getSpeClass(spe)} key={j} onClick={this.selectSpe.bind(this, spe)}>
                  {spe.value}
                </View>
              ))}
            </View>
          ))}
          <View className="ok">
            <AtButton type="primary" onClick={this.ok}>
              确定选择
            </AtButton>
          </View>
        </View>
      </AtFloatLayout>
    );
  }
}

export default Sku as ComponentClass<PageOwnProps, PageState>;
