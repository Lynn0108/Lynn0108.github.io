'use strict';

var UA = navigator.userAgent;
var isIpad = /(iPad).*OS\s([\d_]+)/.test(UA);
var isIpod = /(iPod)(.*OS\s([\d_]+))?/.test(UA);
var isIphone = !isIpad && /(iPhone\sOS)\s([\d_]+)/.test(UA);
var isIos = isIpad || isIpod || isIphone;
var isAndroid = /(Android);?[\s\/]+([\d.]+)?/.test(UA);
var isWechat = /micromessenger/i.test(UA);
var isQQ = /QQ\/([\d\.]+)/.test(UA);
// const isQZone = /Qzone\//.test(UA)
var isQQMBrowser = /MQQBrowser/i.test(UA) && !isWechat && !isQQ;
var isUCMBrowser = /UCBrowser/i.test(UA);
// const isBaiduMBrowser = /mobile.*baidubrowser/i.test(UA)
// const isSogouMBrowser = /SogouMobileBrowser/i.test(UA)
var isBaiduApp = /baiduboxapp/i.test(UA);
var isDingApp = /DingTalk/i.test(UA);

function downHint(data) {
  alert('点击浏览器下方分享');
}
function upRightHint() {
  alert('点击右上角进行分享');
}
// wechat 暂时不能使用 没有config
function Wechat(data) {
  wx.config({
    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: '', // 必填，公众号的唯一标识
    // timestamp: '', // 必填，生成签名的时间戳
    // nonceStr: '', // 必填，生成签名的随机串
    // signature: '',// 必填，签名
    jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
  });
  wx.ready(function () {
    wx.onMenuShareAppMessage({
      title: data.title, // 分享标题
      desc: data.desc, // 分享描述
      link: data.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: data.imgUrl, // 分享图标
      type: '', // 分享类型,music、video或link，不填默认为link
      dataUrl: '' // 如果type是music或video，则要提供数据链接，默认为空
    });
  });
  upRightHint();
}
// UC
function UCIosBrowser(data) {
  //done
  // 需要很久才跳到微信中，why？
  if (ucbrowser.web_shareEX) {
    ucbrowser.web_shareEX(JSON.stringify({
      title: data.title,
      content: data.desc,
      sourceUrl: data.link,
      imageUrl: data.imgUrl,
      source: data.from,
      target: 'kWeixin'
    }));
  } else {
    ucbrowser.web_share(data.title, data.desc, data.link, 'kWeixin', '', from, '');
  }
}
function UCAndroidBrowser(data) {
  //done
  // 不能设置图片
  ucweb.startRequest('shell.page_share', [data.title, data.desc, data.link, 'WechatFriends', '', data.from, data.imgUrl]);
}

// DingTalk
function DingTalk(data) {
  // 分享到微信不需要设置config
  console.log('ding');
  dd.ready(function () {
    dd.biz.util.share({
      type: 0, //分享类型，0:全部组件 默认； 1:只能分享到钉钉；2:不能分享，只有刷新按钮
      url: "https://www.didiglobal.com", //必须要是.com？
      title: data.title,
      content: data.desc,
      image: "http://img-ys011.didistatic.com/static/didiglobal/do1_TALUvCwJjFWByREphR8x"
    });
  });
}
// QQ浏览器 分享到微信需要登录？
function QQMobileBrowser(data) {
  //done
  console.log(QQMobileBrowser);
  if (browser.app) {
    browser.app.share({
      title: data.title,
      description: data.desc,
      url: data.link,
      img_url: data.imgUrl,
      from: data.from,
      to_app: 1
    });
  }
}

// QQ内置浏览器
function QQIos(data) {
  window.mqq.data.setShareInfo({
    title: data.title,
    desc: data.desc,
    image_url: data.imgUrl,
    share_url: data.link
  });
}
function QQAndroid(shareData) {
  if (window.mqq) {
    console.log(4);
    //   mqq.data.setShareInfo({
    //     title: shareData.title,
    //     desc: shareData.desc,
    //     image_url: shareData.imgUrl,
    //     share_url: location.href
    //   }, data => {
    //     console.log(data)
    // });
    window.mqq.invoke("data", "setShareInfo", {
      title: shareData.title,
      desc: shareData.desc,
      image_url: shareData.imgUrl,
      share_url: location.href
    }, function (data) {
      console.log(data);
    });
  }
}

function getShareFunc() {
  var shareFunc = null;
  if (isWechat) {
    shareFunc = Wechat;
  } else if (isQQ && isIos) {
    //done
    // 无法设置分享内容
    // 通过meta设置分享描述 标题自动获取 图片自动获取
    // 新闻详情页链接错误（线上，测试、本地都没有问题）
    // shareFunc = upRightHint
    shareFunc = QQIos;
  } else if (isQQ && isAndroid) {
    shareFunc = QQAndroid;
  } else if (isQQMBrowser) {
    //done
    shareFunc = QQMobileBrowser;
  } else if (isUCMBrowser && isIos) {
    //done
    shareFunc = UCIosBrowser;
  } else if (isUCMBrowser && isAndroid) {
    //done
    shareFunc = UCAndroidBrowser;
  } else if (isBaiduApp) {
    // done
    //无法直接分享，分享按钮右上方调出
    shareFunc = upRightHint;
  } else if (isDingApp && isIos) {
    //done
    shareFunc = DingTalk;
  } else if (isDingApp && isAndroid) {
    //done
    //dingding 安卓没有分享到微信
    shareFunc = upRightHint;
  } else {
    shareFunc = downHint;
  }
  return shareFunc;
}

function WxShare() {
  this.shareDate = {};
  this.shareFunc = getShareFunc();
}

WxShare.prototype.setShareDate = function (obj) {
  this.shareDate = obj;
  return this;
};
WxShare.prototype.setWxConfig = function (obj) {};
WxShare.prototype.share = function () {
  this.shareFunc(this.shareDate);
};