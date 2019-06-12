import Taro from '@tarojs/taro';

export function tip(title: string) {
  return Taro.showToast({
    title,
    icon: 'none',
    duration: 1500,
  });
}

export function Countdown(over_time) {
  const cha = parseInt(((new Date(over_time.replace(/-/g, '/')).getTime() - new Date().getTime()) /
    1000) as any);

  const isShowDay = cha > 86400;
  const day = Math.floor(cha / 86400);
  const time: any = [];
  const lasthour = cha - 86400 * day;
  time.push(Math.floor(lasthour / 3600));
  const lastMin = lasthour - 3600 * time[0];
  time.push(Math.floor(lastMin / 60));
  const lastSec = lastMin - 60 * time[1];
  time.push(Math.floor(lastSec));

  return { isShowDay, day, time };
}

export function getTime(time?) {
  let date;
  if (time) {
    date = new Date(time.replace(/-/g, '/'));
  } else {
    date = new Date();
  }
  return date.getTime();
  // return date.toLocaleString('zh', { hour12: false });
}

export function getLocalTime(time?) {
  let date;
  if (time) {
    date = new Date(time.replace(/-/g, '/'));
  } else {
    date = new Date();
  }
  return date.toLocaleString('zh', { hour12: false });
}

export function getTextTime(time?) {
  let date;
  if (time) {
    date = new Date(time);
  } else {
    date = new Date()
  }
  const dateText = date.getFullYear().toString() + '/'
    + ten(Number(date.getMonth() + 1).toString()) + '/'
    + date.getDate().toString()
    + ' ' + date.toLocaleString('zh', { hour12: false }).split(' ')[1]

  return dateText;
}

function ten(num) {
  if (num < 10) return '0' + num;
  return num;
}