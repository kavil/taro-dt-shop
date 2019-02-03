import Taro from '@tarojs/taro';

export function tip(title: string) {
  Taro.showToast({
    title,
    icon: 'none',
    duration: 1500,
  });
}
