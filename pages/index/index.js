const lunar = require('./lunar.js');
Page({
  data: {
    year: new Date().getFullYear(),      // 年份
    month: new Date().getMonth() + 1,    // 月份
    day: new Date().getDate(),           // 日期

    header: true,                        // 日历标题
    lunar: true,                         // 显示农历
    more: false,                          // 显示非当前月日期                
    week_title: true,                    // 显示周标题
    next: true,                          // 显示下个月
    prev: true,                          // 显示上个月

    cs: 50,                              // 单元格大小
    title_type: 'cn',                    // 周标题类型
    titleType: ['英文单字母', '英语简写', '中文简写'],
    title_index: 0,

    days_color: [],
    select_day_color: "",
    activeType: 'square', // 日期背景效果
    details: {},
    w_birth: "",
    m_birth: "",
  },

  onLoad: function () {
  },

  onShow: function () {
    this.get_birth();
    this.set_days_color(this.data.year, this.data.month, this.data.day);
  },

  get_socre_color: function (score) {
    var color = "#000000"       //黑
    if (score >= 5) {
      color = '#ff0000'         //红
    } else if (score == 4) {
      color = '#FF7F00'         //橙
    } else if (score == 3) {
      color = '#BBBB00'         //黄
    } else if (score == 2) {
      color = '#228B22'         //绿
    } else if (score == 1) {
      color = '#0000EE'         //蓝
    } else if (score <= 0 && score >= -6) {
      color = '#777777'         //灰
    }
    return color
  },

  set_days_color: function (year, month, today) {
    const days_count = new Date(year, month, 0).getDate();


    let days_color = new Array;
    for (let day = 1; day <= days_count; day++) {
      var lunarDate = lunar.solarToLunar(year, month, day);
      var lunarMonth = lunarDate.monthStr;
      var lunarDay = lunarDate.dayStr;
      if (lunarDay == "初一") { lunarDay = lunarMonth };
      var ret = this.cal(year, month, day, lunarMonth, lunarDay);
      days_color.push({ month: 'current', day: day, color: 'white', background: this.get_socre_color(ret.score) });
      if (day == today) { this.set_details(year, month, day, lunarMonth, lunarDay, ret); }
    }

    this.setData({ days_color });
  },

  addYear: function () {
    this.setData({
      year: this.data.year + 1
    });
  },

  subYear: function () {
    this.setData({
      year: this.data.year - 1
    });
  },

  addMonth: function () {
    if (this.data.month == 12) {
      this.setData({
        month: 1,
        year: this.data.year + 1
      });
    }
    else {
      this.setData({
        month: this.data.month + 1
      });
    }
  },

  subMonth: function () {
    if (this.data.month == 1) {
      this.setData({
        month: 12,
        year: this.data.year - 1
      });
    } else {
      this.setData({
        month: this.data.month - 1
      });
    }
  },

  jump2today: function (e) {
    this.setData({
      year: new Date().getFullYear(),      // 年份
      month: new Date().getMonth() + 1,    // 月份
      day: new Date().getDate(),           // 日期
    });
    this.set_days_color(this.data.year, this.data.month, this.data.day);
    getApp().wxastat.sendEvent('跳到今天', {});
  },

  sumbmit_birth: function (e) {
    wx.setStorageSync('w_birth', e.detail.value.w_birth);
    wx.setStorageSync('m_birth', e.detail.value.m_birth);
    this.setData({
      w_birth: e.detail.value.w_birth,
      m_birth: e.detail.value.m_birth,
    });
    getApp().wxastat.sendEvent('设置生日', {});
    this.onShow()
  },

  reset_birth: function () {
    wx.clearStorageSync();
    getApp().wxastat.sendEvent('重置生日', {});
    this.onShow();
  },

  get_birth: function () {
    var w_birth = "2000.1.1";
    var m_birth = "2001.1.2";
    try {
      var value = wx.getStorageSync('w_birth')
      console.log('w_birth:' + value);
      if (value) { w_birth = value }
    } catch (e) { };
    try {
      var value = wx.getStorageSync('m_birth')
      console.log('m_birth:' + value);
      if (value) { m_birth = value }
    } catch (e) { };
    this.setData({
      w_birth: w_birth,
      m_birth: m_birth,
    });
  },

  /**
   * 点击下个月
   */
  nextMonth: function (event) {
    const currentYear = event.detail.currentYear;
    const currentMonth = event.detail.currentMonth;
    const prevMonth = event.detail.prevMonth;
    const prevYear = event.detail.prevYear;
    this.set_days_color(currentYear, currentMonth, 1);
    getApp().wxastat.sendEvent('点击下个月', {});
  },

  /**
   * 点击上个月
   */
  prevMonth: function (event) {
    console.log(event);
    const currentYear = event.detail.currentYear;
    const currentMonth = event.detail.currentMonth;
    const prevMonth = event.detail.prevMonth;
    const prevYear = event.detail.prevYear;
    this.set_days_color(currentYear, currentMonth, 1);
    getApp().wxastat.sendEvent('点击上个月', {});
  },

  /**
   * 日期变更事件
   */
  dateChange: function (event) {
    const currentYear = event.detail.currentYear;
    const currentMonth = event.detail.currentMonth;
    const prevMonth = event.detail.prevMonth;
    const prevYear = event.detail.prevYear;
    this.set_days_color(currentYear, currentMonth, 1);
    getApp().wxastat.sendEvent('选择日期', {});
  },

  num_date: function (start_date, end_date) {
    var start_date = new Date(start_date.replace(/-/g, "/"));
    var end_date = new Date(end_date.replace(/-/g, "/"));
    var days = end_date.getTime() - start_date.getTime();
    var day = parseInt(days / (1000 * 60 * 60 * 24));
    return day;
  },

  lunar_taboo: function (date) {
    const LUNAR_TABOO = { '正月廿五': 1, '二月初二': 1, '三月初九': 1, '三月廿九': 1, '四月初四': 1, '四月初八': 1, '五月初五': 1, '五月初六': 1, '五月初七': 1, '五月十四': 1, '五月十五': 1, '五月十六': 1, '五月十七': 1, '五月廿五': 1, '五月廿六': 1, '五月廿七': 1, '六月廿三': 1, '七月初七': 1, '七月廿二': 1, '八月十五': 1, '八月十六': 1, '九月初九': 1, '九月十七': 1, '十月十月': 1, '十月初十': 1, '闰二月初二': 1, '闰三月初九': 1, '闰三月廿九': 1, '闰四月初四': 1, '闰四月初八': 1, '闰五月初五': 1, '闰五月初六': 1, '闰五月初七': 1, '闰五月十四': 1, '闰五月十五': 1, '闰五月十六': 1, '闰五月十七': 1, '闰五月廿五': 1, '闰五月廿六': 1, '闰五月廿七': 1, '闰六月廿三': 1, '闰六月廿三': 1, '闰七月初七': 1, '闰七月廿二': 1, '闰八月十五': 1, '闰八月十六': 1, '闰九月初九': 1, '闰九月十七': 1, '闰十月闰十月': 1, '闰十月初十': 1, '冬月初四': 1, '冬月十五': 1, '冬月十九': 1, '冬月廿三': 1, '冬月廿五': 1, '冬月廿九': 1, '腊月初七': 1, '腊月廿四': 1, '腊月廿五': 1, '腊月廿九': 1, '腊月三十': 1 };
    return LUNAR_TABOO[date] == 1
  },

  solar_taboo: function (date) {
    const SOLAR_TABOO = { '3.18': 1, '3.19': 1, '3.20': 1, '3.21': 1, '3.22': 1, '3.23': 1, '3.24': 1, '6.18': 1, '6.19': 1, '6.20': 1, '6.21': 1, '6.22': 1, '6.23': 1, '6.24': 1, '9.20': 1, '9.21': 1, '9.22': 1, '9.23': 1, '9.24': 1, '9.25': 1, '9.26': 1, '12.19': 1, '12.20': 1, '12.21': 1, '12.22': 1, '12.23': 1, '12.24': 1, '12.25': 1 };
    return SOLAR_TABOO[date] == 1
  },

  power: function (wd, md) {
    var w1 = wd % 23;
    var w2 = wd % 28;
    var w3 = wd % 33;
    var m1 = md % 23;
    var m2 = md % 28;
    var m3 = md % 33;
    var wi1 = -1;
    var wi2 = -1;
    var wi3 = -1;
    var mi1 = -1;
    var mi2 = -1;
    var mi3 = -1;
    if (w1 >= 0 && w1 <= 10) { wi1 = 1 };
    if (w1 == 5 || w1 == 6) { wi1 = 2 };
    if (w1 == 0 || w1 == 11) { wi1 = -100 };
    if (m1 >= 0 && m1 <= 10) { mi1 = 1 };
    if (m1 == 5 || m1 == 6) { mi1 = 2 };
    if (m1 == 0 || m1 == 11) { mi1 = -100 };

    if (w2 >= 2 && w2 <= 13) { wi2 = 1 };
    if (w2 == 7) { wi2 = 2 };
    if (w2 == 0 || w2 == 14) { wi2 = -100 };
    if (m2 >= 2 && m2 <= 13) { mi2 = 1 };
    if (m2 == 7) { mi2 = 2 };
    if (m2 == 0 || m2 == 14) { mi2 = -100 };

    if (w3 >= 2 && w3 <= 15) { wi3 = 1 };
    if (w3 == 8 || w3 == 9) { wi3 = 2 };
    if (w3 == 0 || w3 == 16) { wi3 = -100 };
    if (m3 >= 2 && m3 <= 15) { mi3 = 1 };
    if (m3 == 8 || m3 == 9) { mi3 = 2 };
    if (m3 == 0 || m3 == 16) { mi3 = -100 };

    return {
      "w1": w1,
      "w2": w2,
      "w3": w3,
      "m1": m1,
      "m2": m2,
      "m3": m3,
      "wi1": wi1,
      "wi2": wi2,
      "wi3": wi3,
      "mi1": mi1,
      "mi2": mi2,
      "mi3": mi3,
    };
  },

  cal: function (year, month, day, lunarMonth, lunarDay) {
    var date = year + '-' + month + '-' + day
    var wd = this.num_date(this.data.w_birth, date);
    var md = this.num_date(this.data.m_birth, date);
    var pw = this.power(wd, md);
    var lt = this.lunar_taboo(lunarMonth + lunarDay);
    var st = this.solar_taboo(month + '.' + day);
    var lti = 0
    var sti = 0
    if (lt) { lti = -100 }
    if (st) { sti = -100 }

    return {
      "score": lti + sti + pw.wi1 + pw.wi2 + pw.wi3 + pw.mi1 + pw.mi2 + pw.mi3,
      "wd": wd,
      "md": md,
      "lt": lt,
      "st": st,
      "power": pw,
    };
  },

  set_details: function (year, month, day, lunarMonth, lunarDay, ret) {
    var HL = { '2': '神童', '1': "高", '-1': '低', '-100': '临界' };

    var taboo = '';
    if (ret.lt || ret.st) { taboo = '禁忌日' }
    this.setData({
      select_day_color: this.get_socre_color(ret.score),
      details: {
        "HL": HL,
        "date": year + "." + month + "." + day + " (" + lunarMonth + lunarDay + ") " + taboo,
        "ret": ret
      }
    });
  },

  dayClick: function (event) {
    const year = event.detail.year;
    const month = event.detail.month;
    const day = event.detail.day;
    const color = event.detail.color;
    const lunarMonth = event.detail.lunarMonth;
    const lunarDay = event.detail.lunarDay;
    const background = event.detail.background;

    var ret = this.cal(year, month, day, lunarMonth, lunarDay);
    this.set_details(year, month, day, lunarMonth, lunarDay, ret);
    getApp().wxastat.sendEvent('点击日期', {});
  }
})