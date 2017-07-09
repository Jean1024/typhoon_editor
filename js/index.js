var imgURL = '';
var URL_year_list = 'http://10.16.48.92:8080/scapi/weather/getty?test=ncg&id=';
// var URL_year_list = 
var page_list = 1;
$(function(){
  // 左侧导航栏高度
  $(".leftnav").height($('body').height() - $('.header').height())
  // 左侧单项点击事件
  $(".leftnav .nav").click(function(){
    var index = $(this).index()
    // console.log(index)
    $(".leftnav .nav").removeClass('active')
    $(this).addClass('active')
    $('.right_content .item').hide()
    $('.right_content .item:eq('+index+')').show()
    $(".leftnav").height($('body').height() - $('.header').height())
  })
  $(".leftnav .nav:eq(0)").click(function(){
    $('.edit_page').hide()
    $('.main_data_list').show()
  })
  // 右侧数据宽度
  $('.right_content').width($('body').width() - $(".leftnav").width() -50 )
  // 渲染选择器
  // render_select(2000,2017)
  // 获取数据method,dataType,callback
  reloadTable(URL_year_list)
  // 提交表单  添加赛事
  // 表单提交不进行跳转获取返回数据
  $('form').submit(function (event) {
    event.preventDefault();
    var form = $(this);
    if (!form.hasClass('fupload')) {
      //普通表单
      $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize()
      }).success(function () {
        
      }).fail(function (jqXHR, textStatus, errorThrown) {
        //错误信息
      });
    }
    else {
      // mulitipart form,如文件上传类
      var formData = new FormData(this);
      $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: formData,
        mimeType: "multipart/form-data",
        contentType: false,
        cache: false,
        processData: false
      }).success(function (yy) {
        alert('上传成功')
        imgURL = yy
      }).fail(function (jqXHR, textStatus, errorThrown) {
        //错误信息
      });
    };
  });
  $("#upButton").click(function(){
    upMessage(imgURL)
  })
// http://61.4.184.177:8080/tjqyh/userInfo/newseditor?title=标题&content=内容&sitepng=图片地址,图片地址
// http://127.0.0.1:8080/userInfo/newseditor?title=气象新闻测试周刊&content=今天晴转龙卷风&sitepng=/home/wangxinyu/news/11B01_red.png
// 个人信息返回按钮
   $('#back').click(function (){
    $(".leftnav .nav").removeClass('active')
    $(".leftnav .nav:eq(0)").addClass('active')
    $('.right_content .item').hide()
    $('.right_content .item:eq(0)').show()
    $(".leftnav").height($('body').height() - $('.header').height())
   })
   $('#exit').click(function (){
    window.localStorage.removeItem('username')
    location.reload([true])
   })
})
window.onresize = function(){
    $('.right_content').width($('body').width() - $(".leftnav").width() -50 )
}

// 重新加载表单数据
function reloadTable(url){  
  var str = ''
  $('.table tr').remove()
  $.get(url,function(data){
    // console.log(data)
    // var new_data = formate_list(data)
    var new_data = JSON.parse(data)['typhoonList']
    // console.log(new_data)
    var data_len = new_data.length
    // var str_log = '找到' + data_len + '条台风记录。'
    // 渲染分页器  ---start
    var page_toltal = Math.ceil(data_len/10);
    // $('.pageTest').page({
    //   leng: page_toltal,//分页总数
    //   activeClass: 'activP' , //active 类样式定义
    //   clickBack:function(page){
    //      renderPageData(new_data,page)
    //   }
    // })
    // 渲染分页器  ---end
    // $('#logYear').html(str_log)
    // 添加某年台风列表
    renderPageData(new_data,1)
    // 修改
    $('.editor_news').click(function(){
      $('.main_data_list').hide()
      $('.edit_page').show()
      var siblings = $(this).parent().siblings()
      var id = $(siblings.get(0)).html()
      // 通过id获取数据
      // console.log(id)
      var URL_id = 'http://10.16.48.92:8080/scapi/weather/getty?test=ncg&id=';
      // var URL_id = 'http://scapi.weather.com.cn/weather/typhoon?view=view_'+id+'&test=ncg';

      $.get(URL_id,function (result) {
       var aData = JSON.parse(result);
       // console.log(aData)
       editTyphoonWay(aData)
      })  
    })
    // // 删除
    // $('.delete_news').click(function(){
    //   var id = $(this).parent().parent().children().first().html()
    //   var data1 = {'ID':id}
    //   // http://61.4.184.177:8080/tjqyh/userInfo/delnewseditor?ID=ID,ID
    //   var info = confirm('确定删除?')
    //   if (info) {
    //     $.post('https://tianjinqixiang.tianqi.cn/tjqyh/userInfo/delnewseditor',data1,function(data){
    //       data = JSON.parse(data)
    //       console.log(data)
    //       if (data.code === 200){
    //         alert('删除成功！')
    //         location.reload([true])   
    //       }
    //     })
    //   }else{

    //   }
    // })
  })
}

// 上传表单数据
function upMessage(imgdata){
  var title = $('#title').val()
  var content = editor.html()
  content = ''+content
  var data1 = {'title':title,'content':content,'sitepng':imgdata}
  $.post('https://tianjinqixiang.tianqi.cn/tjqyh/userInfo/newseditor',data1,function(data){
      data = JSON.parse(data)
      if (data.code === 200){
        alert('提交成功')
        location.reload([true])   
      }
  })
}
// 渲染选择器
function render_select(startYear,endYear) {
  var str = '<option value="">请选择年份</option>'
  var len = endYear - startYear
  for (var i = 0; i <= len; i++) {
    str += '<option class="item_year" value="'+(endYear-i)+'" style="text-align:center;">'+(endYear-i)+'</option>'
  }
  $('#typhoonYear').html(str).css({
    'height':'30px',
    'lingHeihgt': '30px'
  }).change(function () {
    var year = $(this).val() // 选中的年份
    if (!year) return;
    var url = URL_year_list + 'year=list_' + year + '&test=ncg';
    reloadTable(url)
  })
}

// 格式化某年的台风列表
function formate_list(result) {
  var aData = JSON.parse( result.substring( result.indexOf('(')+1 , result.lastIndexOf(')') ) ).typhoonList;
  return aData;
}

// 取出总数据的某一页数据
function renderPageData(data,pageNum) {
    var str = ''
    console.log(pageNum)
    var data_page = data.slice((pageNum-1)*10,pageNum*10)
    $.each(data_page,function(index,value){
      var id = value[0] || "-"
      var name_en = value[1] || "-"
      var name_ch = value[2] || "-"
      var number = value[3] || "-"
      var time = value[4] || "-"
      var meaning = value[6] || "-"
      var state = value[7] || "-"
      var flag = value[8] || "-"
      str += '<tr><td>'+id+'</td><td>'+name_en+'</td><td>'+name_ch+'</td><td>'+number+'</td>'+
      '<td>'+time+'</td><td>'+meaning+'</td><td>'+state+'</td><td>'+flag+'</td><td><button class="editor_news">修改</button><br/><button  class="delete_news">删除</button></td></tr>'
    })
    str = '<thead><th>台风ID</th><th>台风名称(英文)</th><th>台风名称(中文)</th><th>台风编号整形</th><th>台风编号</th><th>台风描述</th><th>台风状态</th><th>是否启用台风</th><th>操作</th></thead>' + str;
    $('.table').html(str)
}

// 修改某个台风路径
function editTyphoonWay(data) {
  var labels = '台风ID,台风名称(英文),台风名称(中文),台风编号整形,台风编号,台风描述,台风状态,是否启用台风,台风信息'.split(",")
  var data = data.typhoonList
  var labels_value = data.slice(0,8)
  // var base_content = ''
  // $.each(labels,function (index,value) {
  //   console.log(index)
  //   console.log(value)
  //   base_content += '<div class="typhoon_base" style="display: inline-block;margin-top: 20px; width:300px;"><label for="12">'+value+'</label><input type="text" value="'+labels_value[index]+'"></div>'
  // })
  // $('.base_content').html(base_content)
}


