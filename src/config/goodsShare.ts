// 输出share config

export const goodsShare = (userInfo, goods, ewm) => {
  const vip: any = [
    {
      type: 'rect',
      background: '#f1836f',
      top: 474,
      left: 132,
      width: 93,
      height: 18,
    },
    {
      type: 'rect',
      background: '#fff',
      top: 475,
      left: 133,
      width: 91,
      height: 16,
    },
    {
      type: 'text',
      content: `会员再打${((goods.sku[0].vip_price / goods.sku[0].retail_price) * 10).toFixed(
        1
      )}折`,
      fontSize: 13,
      color: '#f1836f',
      textAlign: 'left',
      top: 476,
      left: 135,
    },
  ];
  const user: any = [
    {
      type: 'image',
      url: userInfo.avatarUrl || '',
      top: 67,
      left: 28,
      width: 55,
      height: 55,
    },
    {
      type: 'image',
      url: 'https://img.kavil.com.cn/images/nba/201935231332GD5Xe4Fj.png',
      top: 67,
      left: 28,
      width: 55,
      height: 55,
    },
  ];

  let views = [
    {
      type: 'image',
      url: 'https://img.kavil.com.cn/images/nba/2019352254323tJDnHdQ.jpg',
      top: 0,
      left: 0,
      width: 375,
      height: 621,
    },
    {
      type: 'text',
      content: (userInfo.nickName || '') + '推荐给你一个好物',
      fontSize: 16,
      color: '#8f8f8f',
      textAlign: 'left',
      top: 84,
      left: 91,
      bolder: true,
    },
    {
      type: 'image',
      url: goods.list_pic_url.split(',')[0] + '@!480X480',
      top: 133,
      left: 27,
      width: 320,
      height: 320,
    },
    {
      type: 'text',
      content: '￥',
      fontSize: 28,
      color: '#E62004',
      textAlign: 'left',
      top: 462,
      left: 28,
      bolder: true,
    },
    {
      type: 'text',
      content: goods.sku[0].retail_price.toFixed(1),
      fontSize: 36,
      color: '#E62004',
      textAlign: 'left',
      top: 456,
      left: 53,
      bolder: true,
    },
    {
      type: 'text',
      content: '￥' + goods.sku[0].counter_price.toFixed(1),
      fontSize: 16,
      color: '#7E7E8B',
      textAlign: 'left',
      top: 499,
      left: 32,
      textDecoration: 'line-through',
    },
    {
      type: 'text',
      content: goods.goods_name,
      fontSize: 18,
      lineHeight: 21,
      color: '#383549',
      textAlign: 'left',
      top: 532,
      left: 29,
      width: 220,
      MaxLineNumber: 1,
      breakWord: true,
      bolder: true,
    },
    {
      type: 'text',
      content: goods.goods_brief,
      fontSize: 13,
      lineHeight: 15,
      color: '#5b5b5b',
      textAlign: 'left',
      top: 564,
      left: 29,
      width: 220,
      MaxLineNumber: 2,
      breakWord: true,
      bolder: true,
    },
    {
      type: 'image',
      url: ewm,
      top: 500,
      left: 270,
      width: 78,
      height: 78,
    },
    {
      type: 'text',
      content: '长按扫码购买',
      fontSize: 14,
      color: '#747474',
      textAlign: 'left',
      top: 586,
      left: 266,
      lineHeight: 20,
      MaxLineNumber: 2,
      breakWord: true,
      width: 125,
    },
  ];

  if (goods.sku[0].vip_price !== goods.sku[0].retail_price) {
    views = views.concat(vip);
  }
  if (userInfo.id) {
    views = views.concat(user);
  }

  console.log('goodsShare');
  
  return {
    width: 375,
    height: 621,
    views: views,
  };
};
