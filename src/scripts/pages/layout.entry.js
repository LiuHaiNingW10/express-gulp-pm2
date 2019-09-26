(function() {
  var util = require("./util");

  var init = function() {
    
    $("#main");
    layui.config({
      version: "1566370370532" //一般用于更新模块缓存，默认不开启。设为true即让浏览器不缓存。也可以设为一个固定的值，如：201610
      ,debug: false //用于开启调试模式，默认false，如果设为true，则JS模块的节点会保留在页面
      ,base: '' //设定扩展的Layui模块的所在目录，一般用于外部模块扩展
    });
    layui.use(
        [
          "laydate",
          "laypage",
          "layer",
          "table",
          "carousel",
          "upload",
          "element",
          "slider"
        ],
        function() {
          var laydate = layui.laydate, //日期
            laypage = layui.laypage, //分页
            layer = layui.layer, //弹层
            table = layui.table, //表格
            carousel = layui.carousel, //轮播
            upload = layui.upload, //上传
            element = layui.element, //元素操作
            slider = layui.slider; //滑块
  
          //向世界问个好
          layer.msg("Hello World");
  
          //监听Tab切换
          element.on("tab(demo)", function(data) {
            layer.tips("切换了 " + data.index + "：" + this.innerHTML, this, {
              tips: 1
            });
          });
  
          //监听头工具栏事件
          table.on("toolbar(test)", function(obj) {
            var checkStatus = table.checkStatus(obj.config.id),
              data = checkStatus.data; //获取选中的数据
            switch (obj.event) {
              case "add":
                layer.msg("添加");
                break;
              case "update":
                if (data.length === 0) {
                  layer.msg("请选择一行");
                } else if (data.length > 1) {
                  layer.msg("只能同时编辑一个");
                } else {
                  layer.alert("编辑 [id]：" + checkStatus.data[0].id);
                }
                break;
              case "delete":
                if (data.length === 0) {
                  layer.msg("请选择一行");
                } else {
                  layer.msg("删除");
                }
                break;
            }
          });
  
          //监听行工具事件
          table.on("tool(test)", function(obj) {
            //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            var data = obj.data, //获得当前行数据
              layEvent = obj.event; //获得 lay-event 对应的值
            if (layEvent === "detail") {
              layer.msg("查看操作");
            } else if (layEvent === "del") {
              layer.confirm("真的删除行么", function(index) {
                obj.del(); //删除对应行（tr）的DOM结构
                layer.close(index);
                //向服务端发送删除指令
              });
            } else if (layEvent === "edit") {
              layer.msg("编辑操作");
            }
          });
  
          //执行一个轮播实例
          carousel.render({
            elem: "#test1",
            width: "100%", //设置容器宽度
            height: 200,
            arrow: "none", //不显示箭头
            anim: "fade" //切换动画方式
          });
  
          //将日期直接嵌套在指定容器中
          var dateIns = laydate.render({
            elem: "#laydateDemo",
            position: "static",
            calendar: true, //是否开启公历重要节日
            mark: {
              //标记重要日子
              "0-10-14": "生日",
              "2018-08-28": "新版",
              "2018-10-08": "神秘"
            },
            done: function(value, date, endDate) {
              if (date.year == 2017 && date.month == 11 && date.date == 30) {
                dateIns.hint("一不小心就月底了呢");
              }
            },
            change: function(value, date, endDate) {
              layer.msg(value);
            }
          });
  
          //分页
          laypage.render({
            elem: "pageDemo", //分页容器的id
            count: 100, //总页数
            skin: "#1E9FFF", //自定义选中色值
            //,skip: true //开启跳页
            jump: function(obj, first) {
              if (!first) {
                layer.msg("第" + obj.curr + "页", { offset: "b" });
              }
            }
          });
  
          //上传
          upload.render({
            elem: "#uploadDemo",
            url: "", //上传接口
            done: function(res) {
              console.log(res);
            }
          });
  
          slider.render({
            elem: "#sliderDemo",
            input: true //输入框
          });
        }
    );


    function fileSelected() {
      var file = document.getElementById('videoStarIn').files[0];
      var fileSize=file.size;
      return fileSize
    }
  
    $("#videoStarIn").on("change", function(){
      $(".FloatingBox").show();
      $(".PullOutFloatingMain").show();
      $(".PullOut_p11").html("正在上传识别");
      $(".PullOut_p12").html("正在上传识别");
      var videoSize = fileSelected();
      // alert(videoSize);
      if(videoSize>=20*1024*1024){
          // alert("wwww");
          // $(".FloatingBox").hide();
          $(".PullOutFloatingMain").hide();
          $(".FloatingBox").show();
          $(".pictureAndVideoFloatingMain").show();
          $(".pictureAndVideo_p11").html("视频过大");
          $(".pictureAndVideo_p12").html("请重新拍摄，上传视频不能大于20M");
      } else{
          var file = this.files[0];  
          var reader = new FileReader();  
          reader.readAsDataURL(file);//调用自带方法进行转换  
          reader.onload = function(e) {  
              // $("#img_upload_show").attr("src", this.result);//将转换后的编码存入src完成预览  
              // $("#videoStarIn").val(this.result);//将转换后的编码保存到input供后台使用  
              // alert(this.result);
              var img=this.result;
              // var imgType=img.Substring(0,i)
              var imgNum = img.split(";base64,");
              var imgBase=imgNum[1];
              // alert(img);
              // alert(imgBase);
              $(".FloatingBox").show();
              $(".PullOutFloatingMain").show();
              $(".PullOut_p11").html("正在上传识别");
              $(".PullOut_p12").html("正在上传识别");
              // location.href = "shootFront.html";
              $.ajax({
                  url: "dddd",
                  type: "post",
                  dataType: 'json',
                  contentType : 'application/json;charset=utf-8',
                  data: JSON.stringify({
                      "token_random_number":takenNum, //上一步返回的token
                      "video":imgBase,       //活体录像视频 base64编码
                      "videoName":"video.mp4", //带后缀名
                      "biz_no":guidCoder,//一套流程/次 使用相同业务流水号
                      "return_image":"1"//返回最佳的视频抓取图片 "1":返回 ,"0":不返回
                  }),
                  success: function (data) {
                      $(".FloatingBox").hide();
                      $(".PullOutFloatingMain").hide();
                      var code=data.code;
                      if(code=="00000"){
                          // alert(data.data.token_video);  
                          
                      };
                  }
              })         
              
          }
      }
    })
  };

  $(function() {
    init();
  });
})();
