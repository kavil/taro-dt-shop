import Taro from '@tarojs/taro';

export function tip(title: string) {
  Taro.showToast({
    title,
    icon: 'none',
    duration: 1500,
  });
}

export function Countdown(over_time) {
  const cha = (new Date(over_time.replace(/-/g, '/')).getTime() - new Date().getTime()) / 1000;
  const isShowDay = cha > 86400;
  const day = Math.floor(cha / 86400);
  const time: any = [];
  const lasthour = cha - 86400 * day;
  time.push(Math.floor(lasthour / 3600));
  const lastMin = lasthour - 3600 * time[0];
  time.push(Math.floor(lastMin / 60));
  const lastSec = lastMin - 60 * time[1];
  time.push(Math.floor(lastSec));

  return { isShowDay, day, time }
}
