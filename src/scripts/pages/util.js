//
(function () {
  exports.state = {};

  var notLogin = function (url, callback) {
    var iframe = $('<iframe width="0" height="0" src="' + url + '"></iframe>');
    // 未登录跳转地址
    var failUrl = '';
    iframe.load(function () {
      try {
        if (iframe[0] && iframe[0].contentDocument) {
          var html = $(iframe[0].contentDocument.body).html();
          var json = JSON.parse(html);
          if (json.code == 100) {
            callback();
          } else if (json.code == -1003) {
            notLogin(url, callback);
          } else if (json.code == -1002) {
            alert('用户不存在');
          } else {
            console.log('登录失败');
            top.location.href = failUrl;
          }
        }
      } catch (error) {
        console.log(error.message);
        console.log('登陆失败');
        top.location.href = failUrl;
      }
    })
  }
  var myAjax = function (option) {
    var success = option.success;
    option.success = function (res) {
      if (res.code == -1003) {
        notLogin(res.data, function () {
          myAjax(options);
        });
      } else {
        success(res);
      }
    };
    return $.ajax(option);
  };
  exports.myAjax = myAjax;

  var upperObjKey = function (obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        var newKey = i.toUpperCase();
        if (newKey !== i) {
          obj[newKey] = obj[i];
          delete obj[i];
        }
      }
    }
    return obj;
  };

  exports.upperObjKey = upperObjKey;

  exports.upperList = function (arr) {
    for (var i = 0; i < arr.length; i++) {
      list[i] = upperObjKey(list[i]);
    }
    return arr;
  };

  exports.getQueryString = function (str) {
    var reg = new RegExp("(^|&" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
  };

  var base = $('#base-path').attr('data-value') || '';
  exports.base = base;

  exports.load = function (param) {
    if (param.receiver.loaded) {
      return param.cb();
    };
    var ajaxParam = $.extend({
      type: 'get',
      dataType: 'application/json',
      cache: false,
    });
    var success = ajaxParam.success;
    var error = ajaxParam.error;
    ajaxParam.success = function (res) {
      if (res.code == 100) {
        param.receiver.data = res.data || (param.default || []);
      } else {
        param.receiver.tips = res.message;
      };
      param.receiver.loaded = true;
      success && success();
      // 请求已完成
      param.receiver.pedding = false;
      param.cd();
    }
    ajaxParam.error = function (res) {
      error && error();
      // 请求完成
      param.receiver.pedding = false;
      param.cb();
    }
  }
});

var Simple = function (param) {
  if(!param.domId || !param.tplId) {
    console.log('缺少domId或tplId');
    return;
  }
  this.list = [];
  this.originList = [];
  var ajaxParam = {
    dataType: 'json',
    cache: 'false'
  }
  $.extend(param.ajaxParam, ajaxParam);
  $.extend(this, param);

  var that = this;
  this.ajaxParam.success = function (res) {

  };

  this.ajaxParam.success = function (res) {
    if(res.code == 100) {
      that.list = res.data;
      that.originList = _.clone(that.list);
    } else {
      that.tips = res.message || '加载失败';
    }

    if( that.convert) {
      that.convert(that);
    }
    that.render();
  };
  this.ajaxParam.error = function (err) {
    that.tips = '加载失败';
    that.pedding = false;
    that.render();
  };

  $(document).on('pageClicked', '#' + this.pagerId, function ( event, data ) {
    that.page = data.pageIndex;
    that.load();
  })
  
}