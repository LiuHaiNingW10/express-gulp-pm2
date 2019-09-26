var isEmptyObj = function(obj) {
  if (typeof obj === "object" && obj !== null && !(obj instanceof Array)) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return false;
  } else {
    return false;
  }
};
var makeCookieObject = function ( cookieObject ) {
    var m = [];
    for ( var i in cookieObject ) {
        m.push(i.toString() + "=" + cookieObject[i].toString());
    };
    return m.join(';');
};
var makeGetQueryUrl = function(data, query) {
  if (!isEmptyObj(query)) {
    var para = Object.keys(query).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(query[k]);
      }).join("&");
      
    return url + "?" + para;
  }
  return url;
};

var deepClone = function (obj) {
  var cloneObj = Array.isArray(obj) ? []: {};
  if(obj && typeof obj === 'object') {
    for( var i in obj) {
      if( obj.hasOwnProperty(i)) {
        if(obj[i] && typeof obj[i] === 'object') {
          cloneObj[i] = deepClone(obj[i]);
        }else {
          cloneObj[i] = obj[i];
        }
      }
    }
  };
  return cloneObj;
}

module.exports = {
  makeGetQueryUrl,
  makeCookieObject,
  isEmptyObj,
  deepClone

};
