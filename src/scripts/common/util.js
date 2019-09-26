(function () {
  var Util = {}

  /**
    * 模糊搜索输入框
    * @param id，需要绑定模糊搜索的dom，必须
    * @param fuzzySearch 是否启用模糊搜索，默认true
    * @param maxTags 输入框最大标签数，默认5
    * @param width 输入框宽度，默认234
    * @param placeholder 输入框placeholder
    * @param createrUrl，模糊搜索数据url，必须
    */
  Util._getTagsinput = function (opts) {
    return $('#' + opts.id).tagsinput({
      fuzzySearch: opts.fuzzySearch || true, //是否启用模糊搜索
      maxTags: opts.maxTags || 5,
      itemValue: 'id',            //这2个参数编辑时用到
      itemText: 'name',
      width: opts.width || 234, //组件宽度
      placeholder: opts.placeholder,
      inputFontSize: 14,
      keyUnit: 'id',            //模糊搜索列表key属性
      valUnit: 'name',      //模糊搜索列表value(展示)
      ajax: { //ajax返回数组元素属性与keyUnit、valUnit保持一致
        requestData: opts.requestData || {},  //query参数
        requestPath: opts.createrUrl,             //服务端url
        searchKey: opts.searchKey || 'name',            //对应监测输入值得key属性
        requestMethod: opts.requestMethod || 'GET',                 //ajax调用方式
      },
      attach: true,
      onAfterRemote: opts.onAfterRemote
    })
  }

  window.Util = Util
})()
