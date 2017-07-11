var imgURL = '';
// var URL_year_list = 'http://10.16.48.92:8080/scapi/weather/getty?test=ncg&id='; // 列表
// var mdURL ='http://10.16.48.92:8080/scapi/weather/updatty'  // 修改
// var addURL = 'http://10.16.48.92:8080/scapi/weather/insetty' // 添加
var URL_year_list = 'http://scapi.weather.com.cn/weather/getty?test=ncg&id='; // 列表
var mdURL ='http://scapi.weather.com.cn/weather/updatty'  // 修改
var addURL = 'http://scapi.weather.com.cn/weather/insetty' // 添加

var mdId;
var mdObj={}; 
var editJSON;
var zxCount ;
var isOpen;//是否开启台风
var page_list = 1;
var timer2;
if (map) {map = null}
  var map;
  var zoom = 5;
  //初始化地图对象 
    //初始化地图对象 
    map = new T.Map("map");
    //设置显示地图的中心点和级别 
    map.centerAndZoom(new T.LngLat(120, 20), zoom);
    //允许鼠标滚轮缩放地图 
    map.enableScrollWheelZoom();  

  //监听缩放拖拽状态

  map.setMinZoom(4);
  map.setMaxZoom(12);
  var imageURL = "https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}";
  //创建自定义图层对象 
  var lay = new T.TileLayer(imageURL, { minZoom: 4, maxZoom: 12 });
  //将图层增加到地图上 
  map.addLayer(lay);
$(function(){
  // 左侧导航栏高度
  $('.mapContainer').hide()
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
  // 获取数据method,dataType,callback
  reloadTable(URL_year_list)
  // 管理员界面
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
   loadMap()
   // 添加台风渲染
   addTyphoonWay()
})
window.onresize = function(){
    $('.right_content').width($('body').width() - $(".leftnav").width() -50 )
}

// 重新加载表单数据
function reloadTable(url){  
  var str = ''
  $('.table tr').remove()
  $.get(url,function(data){
    var new_data = JSON.parse(data)['typhoonList']
    renderPageData(new_data)
    // 修改
    $('.editor_news').click(function(){

      $('.main_data_list').hide()
      $('.edit_page').show()
      var siblings = $(this).parent().siblings()
      var id = $(siblings.get(0)).html()
      isOpen = $(siblings.get(8)).html()
      mdId = id;
      // 通过id获取数据
      var URL_id = 'http://scapi.weather.com.cn/weather/getty?test=ncg&id='+id;
      $.get(URL_id,function (result) {
       var aData = JSON.parse(result);
       console.log(aData)
       editTyphoonWay(aData)
      })  
    })
    // 删除
    $('.delete_news').click(function(){
      var id = $(this).parent().parent().children().first().html()
      var info = confirm('确定删除?')
      if (info) {
        $.get('http://scapi.weather.com.cn/weather/delty?test=ncg&id=' + id,function(data){
          // console.log(data)
          data = JSON.parse(data)
          // console.log(data)
          if (data.code === 200){
            alert('删除成功！')
            location.reload([true])   
          }
        })
      }else{

      }
    })
  })
}

// 格式化某年的台风列表
function formate_list(result) {
  var aData = JSON.parse( result.substring( result.indexOf('(')+1 , result.lastIndexOf(')') ) ).typhoonList;
  return aData;
}

// 取出总数据的某一页数据
function renderPageData(data) {
  console.log(data)
    var str = ''
    $.each(data,function(index,value){
      var id = value[0] || ""
      var name_en = value[1] || ""
      var name_ch = value[2] || ""
      var number = value[3] || ""
      var time = value[4] || ""
      var yearInfo = value[5] || ""
      var meaning = value[6] || ""
      var state = value[7] || ""
      var flag = value[8] || ""
      str += '<tr><td>'+id+'</td><td>'+name_en+'</td><td>'+name_ch+'</td><td>'+number+'</td>'+
      '<td>'+time+'</td><td>'+yearInfo+'</td><td>'+meaning+'</td><td>'+state+'</td><td>'+flag+'</td><td><button class="editor_news">修改</button><br/><button  class="delete_news">删除</button></td></tr>'
    })
    str = '<thead><th>台风ID</th><th>台风名称(英文)</th><th>台风名称(中文)</th><th>台风编号整形</th><th>台风编号</th><th>年份信息</th><th>台风描述</th><th>台风状态</th><th>是否启用台风</th><th>操作</th></thead>' + str;
    $('.table').html(str)
}

// 修改某个台风路径
function editTyphoonWay(data) {
  editJSON = data;
  console.log(data)
  $('#pointsInfo').empty()
  // 基本信息
  var labels = '台风ID,台风名称(英文),台风名称(中文),台风编号整形,台风编号,台风年份编号,台风描述,台风状态,是否启用台风,台风信息'.split(",")
  var data = data.typhoon
  console.log(data)
  var base_content = ''
  for (var i = 0; i < 8; i++) {
   if (labels[i]) {
    if (0===i || 3 === i|| 4 === i|| 5 === i|| 8 === i) {
      base_content += `<div class="typhoon_base" style="display: inline-block;margin-top: 20px; width:300px;">
      <label for="12" style="width:200px;display:inline-block;font-size:12px;">${labels[i]}</label>
      <input class="titleTyphoon" type="number" value="${data[i] || ''}"></div>`
    }else{
      base_content += `<div class="typhoon_base" style="display: inline-block;margin-top: 20px; width:300px;">
      <label for="12" style="width:200px;display:inline-block;font-size:12px;">${labels[i]}</label>
      <input class="titleTyphoon" type="text" value="${data[i] || ''}"></div>`
    }
   }
  }
  base_content += `<div class="typhoon_base" style="display: inline-block;margin-top: 20px; width:300px;">
    <label for="12" style="width:200px;display:inline-block;font-size:12px;">是否启用台风</label>
    <input class="titleTyphoon" type="number" value="${isOpen}"></div>`
  $('.base_content').html(base_content)
  // 路径信息
  // var pointsInfo = JSON.parse(data[data.length - 1]) // 台风中的路径信息与上面保持一致
  var points = data[8] // 路径中的点信息数组
  console.log(points)
  var titleArr = '编号,日期,时间戳,类型,lon,lat,气压,最大风速,未来移向,风力,风圈信息,未来走向,时间信息,操作'.split(',')
  var $thead = ''
  $.each(titleArr,function (index,value) {
    $thead += `<td style="font-size:12px;">${value}</td>`
  })
  $thead = $('<tr></tr>').append($thead)
  var $table = $('<table></table>').append($thead)
  console.log($table)
  var $tbody = ''
  for (var i = 0; i < points.length; i++) {
    var value = points[i]
     $tbody += `<tr class="tr_item"><td  style="font-size:12px;">${value[0]}</td>
                    <td  style="font-size:12px;">${value[1]}</td>
                    <td  style="font-size:12px;">${value[2]}</td>
                    <td  style="font-size:12px;">${value[3]}</td>
                    <td  style="font-size:12px;">${value[4]}</td>
                    <td  style="font-size:12px;">${value[5]}</td>
                    <td  style="font-size:12px;">${value[6]}</td>
                    <td  style="font-size:12px;">${value[7]}</td>
                    <td  style="font-size:12px;">${value[8]}</td>
                    <td  style="font-size:12px;">${value[9]}</td>
                    <td  style="font-size:12px;">-</td>
                    <td  style="font-size:12px;">-</td>
                    <td  style="font-size:12px;">-</td>
                    <td  style="font-size:12px;"><button class="modify_point">修改</button></td></tr>`
  }
  $table = $table.append($tbody).appendTo($('#pointsInfo'))
  $('<button id="submitForm" style="margin-top:20px;">提交</button><button id="preView" style="margin:20px 0 0 20px;">预览</button><button id="addTyphoonPoint" style="margin:20px 0 0 20px;">添加路径点</button>').appendTo($('#pointsInfo'))
  $('.modify_point').click(function(){
    var index = $(this).parent().parent().index() - 1
    var point_data = points[index]
    maskEditor(point_data,index)
  })
  // 添加路径点
  $('#addTyphoonPoint').click(function () {
    addPointMask()
  })
  // 提交
  $('#submitForm').click(function () {
    // 修改页头部信息保存
    for (var i = 0; i < 8; i++) {
      if (0===i ||3===i ||4===i ||5===i){
        editJSON.typhoon[i] = parseFloat($('.titleTyphoon')[i].value) || null
      }else{
        editJSON.typhoon[i] = $('.titleTyphoon')[i].value || null
      }
      
    }
    var gg = "TID,TNAME,TZNAME,TINTNUB,TNUMBER,TFBH,ZDESCRIBE,ZSTATUS,SFQY".split(',')
    for (var i = 0; i < gg.length - 1; i++) {
       editJSON[gg[i]] = editJSON.typhoon[i]
    }
    // 是否开启台风
    editJSON[gg[8]] = $('.titleTyphoon')[8].value
    console.log(editJSON)
    var data ={test:'ncg',id:mdId,data:JSON.stringify(editJSON)}

    $.ajax({
      type: 'post',
      url: mdURL,
      data: data,
      success:function (data) {
        data =JSON.parse(data)
        if (data.code ==200) {
          alert('修改成功！')
          window.location.reload([true])
        }
      }
    })
  })
  // 预览
  $('#preView').click(function () { 
    // 修改页头部信息保存
    for (var i = 0; i < 8; i++) {
      editJSON.typhoon[i] = $('.titleTyphoon')[i].value || null
    }
    var gg = "TID,TNAME,TZNAME,TINTNUB,TNUMBER,TFBH,ZDESCRIBE,ZSTATUS,SFQY".split(',')
    for (var i = 0; i < gg.length - 1; i++) {
      editJSON[gg[i]] = editJSON.typhoon[i]
    }
    // 是否开启台风
    editJSON[gg[8]] = $('.titleTyphoon')[8].value
    console.log(editJSON)
     gggg(editJSON)
    $('.mapContainer').show()
    $(window).resize()
  })
}
// 添加路径点
function addPointMask() {
  var data = ["2318244","201704180000","1492473600000","TD","116.8","15.3","1006","13","NNE","11",[],{"BABJ":[["11","201704180000","117.1","16.3","1006","13","BABJ","TD"],["11","201704180000","117.3","17.4","1007","12","BABJ","TD"]]},[null,null,"201704180801","2017年04月18日08时00分"]]
  $('.mask').empty()
  var titleArr = '编号,日期,时间戳,类型,lon,lat,气压,最大风速,未来移向,风力,风圈信息,未来走向,时间信息'.split(',')
  var maskStr = ''
  for (var i = 0; i < 10; i++) {
    maskStr += `<label style="width:80px;display:inline-block;" for="${titleArr[i]}">${titleArr[i]}:</label><input class="items1" type="text" value="${data[i] || ''}"/><br/>`
  }
  // 风圈信息
  var fqInfo = '风圈等级,半径(东部),半径(南部),半径(西部),半径(北部),编号'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="风圈信息">风圈信息:</label><br/>`
  var windCircle = data[10]
  for (var j = 0; j < 6; j++) {
      maskStr += `<label style="width:80px;display:inline-block;" for="">${fqInfo[j]}:</label><input class="windItem" type="text" value=
      "${windCircle[i] || ""}"/>` 
  }  

  // 未来走向
  var wlInfo = '预测点,到达时间,lon,lat,中心气压,最大风速,预测单位,台风级别'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="未来走向">未来走向:</label><br/>`
  var preWay = data[11]['BABJ']
  zxCount = preWay.length
  for (var k = 0; k < zxCount; k++) {
    var preWayValue = preWay[k]
    maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="走向">走向${k+1}:</label><br/>`
    for (var y = 0; y < preWayValue.length; y++) {
       maskStr += `<label style="width:80px;display:inline-block;" for="">${wlInfo[y]}:</label><input  class="zx${k+1}"  type="text" value=
      "${preWayValue[y] || ""}"/>` 
    }
  }  
  // 时间信息
  var tmInfo = '日期,日期,日期,日期'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="时间信息">时间信息:</label><br/>`
  var timeInfo = data[12]
  for (var q = 0; q < 4; q++) {
    var timeValue = timeInfo[q]
     maskStr += `<label style="width:80px;display:inline-block;" for="">${tmInfo[q]}:</label><input class="sjInfo" type="text" value=
      "${timeValue|| ""}" />` 
  } 
  // 提交或者返回
   maskStr += `<div class="bottomTip"><button class='addPointSure' style="margin: 20px 100px;">添加</button><button  style="margin: 20px 100px;" class="cancelModify">返回</button></div>`
  $('.mask').append(maskStr)
  $('.mask_shadow').show()
  // 返回点击
  $('.cancelModify').click(function () {
    $('.mask_shadow').hide()
  })
  // 提交添加路径
  $('.addPointSure').click(function () {
    var index = $('.tr_item').length
    console.log(index)
    console.log(editJSON)
    editJSON.typhoon[8][index] = []
    for (var i = 0; i < 10; i++) {
      var value = $('.items1')[i].value
      if (1===i || 3===i || 8===i) {
        editJSON.typhoon[8][index][i] = value
      }else{
        editJSON.typhoon[8][index][i] = parseFloat(value)
      }
    }
    // 保存风圈信息
    editJSON.typhoon[8][index][10] = []
    var windArr = []
    for (var j = 0; j < 6; j++) {
      var value1 = $('.windItem')[j].value
      if (value1 !== ''){
        if (0 === j) { 
          windArr.push(value1)
        }else{
          windArr.push(parseFloat(value1))
        }
      }
    }
    if (windArr.length) {
      editJSON.typhoon[8][index][10][0] = windArr
    }

    console.log(editJSON.typhoon[8][index])
    // 未来走向
    var zouXiangArr = []
    editJSON.typhoon[8][index][11] ={}
    editJSON.typhoon[8][index][11]['BABJ'] =[]
    for (var k = 0; k < zxCount; k++) {
      var zxValue = $('.zx' + (k+1))
      var zxArr = []
      for (var d = 0; d < zxValue.length; d++) {
        var value2 = zxValue[d].value
        if (1===d || 6===d || 7===d) {
          zxArr.push(value2)
        }else{
          zxArr.push(parseFloat(value2))
        }
      }
      editJSON.typhoon[8][index][11]['BABJ'][k] = zxArr
    }
    // 时间信息
    var timeArr = []
    for (var f = 0; f < 4; f++) {
      var value3 = $('.sjInfo')[f].value
      if (value3) {timeArr.push(value3)} else {timeArr.push(null)}
    }
    editJSON.typhoon[8][index][12] = timeArr
     $('.mask_shadow').hide()

    $('#submitForm').click()
  })
}
// 弹框修改信息
function maskEditor(data,index) {
  $('.mask').empty()
  var titleArr = '编号,日期,时间戳,类型,lon,lat,气压,最大风速,未来移向,风力,风圈信息,未来走向,时间信息'.split(',')
  var maskStr = ''
  for (var i = 0; i < 10; i++) {
    maskStr += `<label style="width:80px;display:inline-block;" for="${titleArr[i]}">${titleArr[i]}:</label><input class="items1" type="text" value="${data[i] || ''}"/><br/>`
  }
  // 风圈信息
  var fqInfo = '风圈等级,半径(东部),半径(南部),半径(西部),半径(北部),编号'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="风圈信息">风圈信息:</label><br/>`
  var windCircle = data[10]
  for (var j = 0; j < 6; j++) {
      maskStr += `<label style="width:80px;display:inline-block;" for="">${fqInfo[j]}:</label><input class="windItem" type="text" value=
      "${windCircle[i] || ""}"/>` 
  }  

  // 未来走向
  var wlInfo = '预测点,到达时间,lon,lat,中心气压,最大风速,预测单位,台风级别'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="未来走向">未来走向:</label><br/>`
  var preWay = data[11]['BABJ']
  zxCount = preWay.length
  for (var k = 0; k < zxCount; k++) {
    var preWayValue = preWay[k]
    maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="走向">走向${k+1}:</label><br/>`
    for (var y = 0; y < preWayValue.length; y++) {
       maskStr += `<label style="width:80px;display:inline-block;" for="">${wlInfo[y]}:</label><input  class="zx${k+1}"  type="text" value=
      "${preWayValue[y] || ""}"/>` 
    }
  }  
  // 时间信息
  var tmInfo = '日期,日期,日期,日期'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;" for="时间信息">时间信息:</label><br/>`
  var timeInfo = data[12]
  for (var q = 0; q < 4; q++) {
    var timeValue = timeInfo[q]
     maskStr += `<label style="width:80px;display:inline-block;" for="">${tmInfo[q]}:</label><input class="sjInfo" type="text" value=
      "${timeValue|| ""}" />` 
  } 
  // 提交或者返回
   maskStr += `<div class="bottomTip"><button class='updataNow' style="margin: 20px 100px;">保存</button><button  style="margin: 20px 100px;" class="cancelModify">返回</button></div>`
  $('.mask').append(maskStr)
  $('.mask_shadow').show()
  // 返回点击
  $('.cancelModify').click(function () {
    $('.mask_shadow').hide()
  })
  // 提交点击
  $('.updataNow').click(function () {
    for (var i = 0; i < 10; i++) {
      var value = $('.items1')[i].value
      if (1===i || 3===i || 8===i) {
        editJSON.typhoon[8][index][i] = value
      }else{
        editJSON.typhoon[8][index][i] = parseFloat(value)
      }
    }
    // 保存风圈信息
    editJSON.typhoon[8][index][10] = []
    var windArr = []
    for (var j = 0; j < 6; j++) {
      var value1 = $('.windItem')[j].value
      if (value1 !== ''){
        if (0 === j) { 
          windArr.push(value1)
        }else{
          windArr.push(parseFloat(value1))
        }
      }
    }
    if (windArr.length) {
      editJSON.typhoon[8][index][10][0] = windArr
    }

    console.log(editJSON.typhoon[8][index])
    // 未来走向
    var zouXiangArr = []
    for (var k = 0; k < zxCount; k++) {
      var zxValue = $('.zx' + (k+1))
      var zxArr = []
      for (var d = 0; d < zxValue.length; d++) {
        var value2 = zxValue[d].value
        if (1===d || 6===d || 7===d) {
          zxArr.push(value2)
        }else{
          zxArr.push(parseFloat(value2))
        }
      }
      editJSON.typhoon[8][index][11]['BABJ'][k] = zxArr
    }
    // 时间信息
    var timeArr = []
    for (var f = 0; f < 4; f++) {
      var value3 = $('.sjInfo')[f].value
      if (value3) {timeArr.push(value3)} else {timeArr.push(null)}
    }
    editJSON.typhoon[8][index][12] = timeArr
     $('.mask_shadow').hide()
  })
}
// 添加某个台风
function addTyphoonWay() {
  var pointIndex = 1
  $('#pointsInfo1').empty()
  // 基本信息
  var labels = '台风ID,台风名称(英文),台风名称(中文),台风编号整形,台风编号,台风年份编号,台风描述,台风状态,是否启用台风'.split(",")
  var base_content = ''
  for (var i = 0; i < 8; i++) {
   if (labels[i]) {
        if (0===i || 3 === i|| 4 === i|| 5 === i|| 8 === i) {
          base_content += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;">
              <label for="12" style="width:200px;display:inline-block;font-size:12px;">${labels[i]}</label>
              <input class="addtitleTyphoon" type="number" value=""></div>`
        }else{
          base_content += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;">
              <label for="12" style="width:200px;display:inline-block;font-size:14px;">${labels[i]}</label>
              <input class="addtitleTyphoon" type="text" value=""></div>`
        }
   }
  }
  base_content += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;">
    <label for="12" style="width:200px;display:inline-block;font-size:14px;">是否启用台风</label>
    <input class="addtitleTyphoon" type="number" value=""></div>`
  $('.base_content1').html(base_content)
  // 路径信息
  var addTxt = `<div id="addContainer"></div><button id="addTyphoon" style="width: 100px;height:30px;margin:30px 0 0 0;">添加路径</button><button id="submitAdd" style="width: 100px;height:30px;margin:30px 0 0 0;">提交</button>
  <button id="addPreView" style="width: 100px;height:30px;margin:30px 0 0 0;">预览</button>`
  $('#pointsInfo1').html(addTxt)
  // 添加路径
  $('#addTyphoon').click(function () {
    addPoint(pointIndex)
    pointIndex++
  })
  // 提交
  $('#submitAdd').click(function () {
    var typhoonData = {}
    typhoonData.typhoon = []
    // 修改页头部信息保存
    var gg = "TID,TNAME,TZNAME,TINTNUB,TNUMBER,TFBH,ZDESCRIBE,ZSTATUS,SFQY".split(',')
    for (var i = 0; i < 9; i++) {
        if (i < 8) {
          if (0 === i ||3 === i ||4 === i ||5 === i) {
            typhoonData.typhoon[i] = parseFloat($('.addtitleTyphoon')[i].value)
          }else{
            typhoonData.typhoon[i] = $('.addtitleTyphoon')[i].value
          }
        }
        typhoonData[gg[i]] = $('.addtitleTyphoon')[i].value
    }
    // 点信息保存
    // var countPoint = pointIndex -1
    var countPoint = $('.point_info').length
    var finalArr = []
    for (var j = 0; j < countPoint; j++) {
      // 点的基本信息
      var arr = []
      $.each($('.point_info:eq('+j+') .additems1'),function (index,value) {
        if (1===index || 3===index || 8===index) {
          arr.push(value.value)
        }else{
          arr.push(parseFloat(value.value))
        }
      })
      // 风圈信息addwindItem
       var wind = []
       $.each($('.point_info:eq('+j+') .addwindItem'),function (index,value) {
        if(value.value) {
          if (0 === index) {
            wind.push(value.value)
          }else{
            wind.push(parseFloat(value.value))
          }
        }
      })
       if (wind.length) {arr.push(wind)}else{arr.push([])}
      
      // 未来走向
       var forest= []
       $.each($('.point_info:eq('+j+') .addForest'),function (index,value) {
        if (1===index || 6===index || 7===index) {forest.push(value.value)}else{forest.push(parseFloat(value.value))}
      })
      arr[11] ={}
      arr[11]['BABJ'] = []
      arr[11]['BABJ'].push(forest)
      // 时间信息
       var timerInfo= []
       $.each($('.point_info:eq('+j+') .addsjInfo'),function (index,value) {
        timerInfo.push(value.value)
      })
      arr[12] =timerInfo
      finalArr.push(arr)
    }
      typhoonData.typhoon[8] = finalArr
      typhoonData.typhoon[9] = null
    // //////////
    
    var postObj = {
      test:'ncg',
      id:'',
      data: JSON.stringify(typhoonData)
    }
     $.ajax({
      type: 'post',
      url: addURL,
      data: postObj,
      success:function (result) {
        var data = JSON.parse(result)
        if (data.code === 200) {
          alert('添加成功')
          window.location.reload([true])
        }
      }
    })
    console.log(typhoonData)
  })
  // 预览
  $('#addPreView').click(function () { 
    var typhoonData = {}
    typhoonData.typhoon = []
    // 修改页头部信息保存
    var gg = "TID,TNAME,TZNAME,TINTNUB,TNUMBER,TFBH,ZDESCRIBE,ZSTATUS,SFQY".split(',')
    for (var i = 0; i < 9; i++) {
        if (i < 8) {
          typhoonData.typhoon[i] = $('.addtitleTyphoon')[i].value
        }
        typhoonData[gg[i]] = $('.addtitleTyphoon')[i].value
    }
    // 点信息保存
    var countPoint = pointIndex -1
    var finalArr = []
    for (var j = 0; j < countPoint; j++) {
      // 点的基本信息
      var arr = []
      $.each($('#id1 .additems1'),function (index,value) {
        arr.push(value.value)
      })
      // 风圈信息addwindItem
       var wind = []
       $.each($('#id1 .addwindItem'),function (index,value) {
        if (value.value) {wind.push(value.value)}
      })
      wind.length?arr.push([wind]):arr.push([])
      // 未来走向
       var forest= []
       $.each($('#id1 .addForest'),function (index,value) {
        forest.push(value.value)
      })
      arr[11] ={}
      arr[11]['BABJ'] = []
      arr[11]['BABJ'].push(forest)
      // 时间信息
       var timerInfo= []
       $.each($('#id1 .addsjInfo'),function (index,value) {
        timerInfo.push(value.value)
      })
      arr[12] =timerInfo


      finalArr.push(arr)
      typhoonData.typhoon[8] = finalArr
      typhoonData.typhoon[9] = null
    }
    // //////////
    
    gggg(typhoonData)
    $('.mapContainer').show()
  })

}
// 添加台风点
function addPoint(pointIndex) {

  var titleArr = '编号,日期,时间戳,类型,lon,lat,气压,最大风速,未来移向,风力,风圈信息,未来走向,时间信息'.split(',')
  var maskStr = ''
   maskStr += `<label style="width:140px;display:inline-block;font-weight:700;margin-top: 20px;font-size:16px;" for="">添加点基本信息:</label><br/>`
  for (var i = 0; i < 10; i++) {
    if (1 ===i) {
      maskStr += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;"><label style="width:80px;display:inline-block;font-size:14px;" for="${titleArr[i]}">${titleArr[i]}:</label><input class="additems1 time_before" type="text" value=""/></div>`
    }else if(2===i){
      maskStr += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;"><label style="width:80px;display:inline-block;font-size:14px;" for="${titleArr[i]}">${titleArr[i]}:</label><input class="additems1 time_after" type="text" value=""/></div>`
    }else{
      maskStr += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;"><label style="width:80px;display:inline-block;font-size:14px;" for="${titleArr[i]}">${titleArr[i]}:</label><input class="additems1" type="text" value=""/></div>`
    }
  }
  maskStr += '<br/>'
  // 风圈信息
  var fqInfo = '风圈等级,半径(东部),半径(南部),半径(西部),半径(北部),编号'.split(',')
  maskStr += `<label style="width:80px;font-size:16px;display:inline-block;font-weight:700;margin-top: 20px; " for="风圈信息">风圈信息:</label><br/>`
  for (var j = 0; j < 6; j++) {
      maskStr += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px; width:300px;"><label style="width:80px;display:inline-block;font-size:14px;" for="">${fqInfo[j]}:</label><input class="addwindItem" type="text" value=
      ""/></div>` 
  }  
  maskStr += '<br/>'
  // 未来走向
  var wlInfo = '预测点,到达时间,lon,lat,中心气压,最大风速,预测单位,台风级别'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;font-size:16px;" for="未来走向">未来走向:</label><br/>`
  for (var y = 0; y < 8; y++) {
     maskStr += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px;font-size:14px; width:300px;"><label style="width:80px;display:inline-block;" for="">${wlInfo[y]}:</label><input class="addForest" type="text" value=
    ""/></div>` 
  }
  maskStr += '<br/>'
  // 时间信息
  var tmInfo = '日期,日期,日期,日期'.split(',')
  maskStr += `<label style="width:80px;display:inline-block;font-weight:700;margin-top: 20px;font-size:16px;" for="时间信息">时间信息:</label><br/>`
  for (var q = 0; q < 4; q++) {

     maskStr += `<div class="addtyphoon_base" style="display: inline-block;margin-top: 20px;font-size:14px; width:300px;"><label style="width:80px;display:inline-block;font-size:14px;" for="">${tmInfo[q]}:</label><input class="addsjInfo" type="text" value=
      "" /></div>` 
  } 
  maskStr += '<button class="deleteSelf" style="width:60px;">移除</button><br/><br/><hr/>'
  $('#addContainer').append(`<div class="point_info">${maskStr}</div>`)
  $('.deleteSelf').click(function () {
    $(this).parent().remove()
  })
  $('.time_before').blur(function () {
    var str=$(this).val()
    str = timeStamp(str)
    $(this).parent().next().find('.time_after').val(str)
  })
}

// 划台风
function drawTyphoon(data) {
}


function loadMap() {
}

// 地图台风
function preView(myData) {
   //地图
  var map;
  var zoom = 5;
  //初始化地图对象 
  map = new T.Map("map");
  //设置显示地图的中心点和级别 
  map.centerAndZoom(new T.LngLat(120, 20), zoom);
  //允许鼠标滚轮缩放地图 
  map.enableScrollWheelZoom();

  //监听缩放拖拽状态

  // map.setMinZoom(4);
  // map.setMaxZoom(12);
  var imageURL = "https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}";
  //创建自定义图层对象 
  var lay = new T.TileLayer(imageURL, { minZoom: 1, maxZoom: 12 });
  //将图层增加到地图上 
  map.addLayer(lay);
  var oTime = {};
  var oMarkers = {};
  var oLine = {};
  var aLunar = []; //风圈；
  var oMaxWindSpeed = {}; //风速
  $('.loading_tip').show();
  addTyphoon(myData);
  function addTyphoon(myData) {
     $('.loading_tip').hide();
     var aData = myData.typhoon;
     var oDay = _tranDate(aData); //台风开始时间
     var allPionts = aData[8];

     var forecastPiont = []; //预测点
     for (var i = 0; i < allPionts.length; i++) {
       if (allPionts[i][11]) {
         forecastPiont = allPionts[i][11].BABJ;
       }
     }

     var aMarker = [], //所有标记点
       aLine = [], //两点划线用 
       aLinePionts = [], //所有线的点
       aMaxWindSpeed = [], //所有点的风速
       aLastPiont = [], //定旋转团点
       aLastTime = []; //台风最后时间

     // $('.content>h2').html(oDay.name + '（第' + aData[3] + '号台风）').show();

     var latlng = new T.LngLat(allPionts[0][4], allPionts[0][5]);
     var infoWin = new T.InfoWindow();
     infoWin.setLngLat(latlng);
     //设置信息窗口要显示的内容
     infoWin.setContent(aData[2] + ' ' + aData[1]);
     //向地图上添加信息窗口
     aLinePionts.push(infoWin);
     map.addOverLay(infoWin);


     var aPionts = []; //点的经纬度
     var LENG = allPionts.length;
     for (var i = 0; i < LENG; i++) {
       var obj = {};
       obj.lng = allPionts[i][4];
       obj.lat = allPionts[i][5];
       aPionts.push(obj);
       aMaxWindSpeed.push([allPionts[i][9], allPionts[i][1]]);

     }
     // oMaxWindSpeed[ID] = aMaxWindSpeed;
     //设置地图中心点
     map.centerAndZoom(new T.LngLat(aPionts[parseInt(LENG / 2)].lng, aPionts[parseInt(LENG / 2)].lat), zoom);

     var iNow = 0,
     index = null;
     var timer = setInterval(function () {
       var pion = new T.LngLat(aPionts[iNow].lng, aPionts[iNow].lat);
       var iconObj = _typhoonType(allPionts[iNow][3]);
       var icon = new T.Icon({
         iconUrl: iconObj.photoSrc,
         iconSize: new T.Point(10, 10)
       });

       if (iconObj.isTrue) {
         aLastPiont.push(new T.LngLat(aPionts[iNow - 1].lng, aPionts[iNow - 1].lat))
         aLastTime.push(_tranDate(allPionts[iNow - 1][1]));
         iconObj.isTrue = false;
       }

       var marker = new T.Marker(pion, { icon: icon });

       ! function (index) {

         marker.addEventListener('click', function () {
           var aPiont = allPionts[index];

           var _thisPiont = new T.LngLat(aPiont[4], aPiont[5]);
           $('.masg-text').html('');
           $('.masg-text').append('<p>' + aData[2] + ' ' + aData[1] + '</p>')
             .append('<p class="color">' + _tranDate(aPiont[1]) + '</p>')
             .append('<p>中心气压：' + aPiont[6] + '百帕</p>')
             .append('<p>最大风速：' + aPiont[7] + '米/秒</p>')
             .append('<p>未来移向：' + testWind(aPiont[8]) + '</p>');

           if (aPiont[10].length) { //有风圈信息

             if (aLunar.length) {
               for (var i = 0; i < aLunar.length; i++) {
                 map.removeOverLay(aLunar[i]);
               }
               aLunar = [];
             }
             $('.masg-text').append('<p>7级风圈半径：' + aPiont[10][0][1] + '</p>')
             var icon7 = new T.Icon({
               iconUrl: 'img/tflj/fq_7j.png',
               iconSize: new T.Point(40, 40)
             });
             var marker7 = new T.Marker(_thisPiont, { icon: icon7 });
             aLunar.push(marker7);
             map.addOverLay(marker7);

             if (aPiont[10][1]) {
               $('.masg-text').append('<p>10级风圈半径：' + aPiont[10][1][1] + '</p>')
               var icon10 = new T.Icon({
                 iconUrl: 'img/tflj/fq_10j.png',
                 iconSize: new T.Point(60, 60)
               });
               var marker10 = new T.Marker(_thisPiont, { icon: icon10 });
               aLunar.push(marker10);
               map.addOverLay(marker10);
             }
           }
           var oPixelPoint = map.lngLatToContainerPoint({ lng: aPiont[4], lat: aPiont[5] });
           $('.masg').css({
             "left": oPixelPoint.x + 'px',
             "top": oPixelPoint.y + 'px'
           }).show()

           return false
         });
       }(iNow)

       aMarker.push(marker);
       map.addOverLay(marker);
       // oMarkers[ID] = aMarker;

       if (aLine.length >= 2) { aLine.shift() }
       aLine.push(pion);
       var line = new T.Polyline(aLine, {
         color: 'red',
         weight: 2,
         lineStyle: iconObj.lineStyle
       });
       map.addOverLay(line);
       aLinePionts.push(line)
       // oLine[ID] = aLinePionts;

       iNow++;
       if (iNow == aPionts.length) {
         clearInterval(timer)
         var label = new T.Label({
           // text: aData[2] + '（' + ( aLastTime[0] ? aLastTime[0] : _tranDate(allPionts[ iNow-1 ][1]) ) +'）',
           text: '最新位置：' + (aLastTime[0] ? aLastTime[0] : tranTime(allPionts[iNow - 1][1])) + '<div class="trigon"></div>',
           position: aLastPiont[0] ? aLastPiont[0] : pion,
           offset: new T.Point(-sourceSize * 10, 0)
         });
         label.addEventListener('click', function () {
           $('#curve').stop().show().animate({
             'right': '18.5rem'
           })
           // initEcharts(oMaxWindSpeed[ID], oDay);

           return false;
         })

         //创建地图文本对象
         map.addOverLay(label);
         aMarker.push(label);

         var icon = new T.Icon({
           iconUrl: 'img/tflj/台风.png',
           iconSize: new T.Point(26, 30)
         });
         var marker = new T.Marker(aLastPiont[0] ? aLastPiont[0] : pion, { icon: icon, zIndexOffset: -500 });
         aMarker.push(marker);
         // oMarkers[ID] = aMarker;
         map.addOverLay(marker);

         $('img[src="img/tflj/台风.png"]').css({
           "transformOrigin": '13px 15px 0',
         })

         // 旋转点
         var n = 0;
         setTimeout(function () {
           var timer2 = setInterval(function () {
             var transfrom = $(marker.Ir).get(0).style.transform;
             n -= 2;
             if (n <= -20) { n = -30 };
             $(marker.Ir).css('transform', '');
             $(marker.Ir).css('transform', transfrom + ' rotate(' + n + 'deg)');
           }, 60)
           // oTime[ID] = timer2;
         }, 200);

         //预测点

         var for_aline = [];
         for_aline.push(aLastPiont[0] ? aLastPiont[0] : pion);

         var for_iNow = 0;
         var forecastTimer = setInterval(function () {
           var for_pion = new T.LngLat(forecastPiont[for_iNow][2], forecastPiont[for_iNow][3]);
           var iconObj = _typhoonType(forecastPiont[for_iNow][7]);
           var forecast_icon = new T.Icon({
             iconUrl: iconObj.photoSrc,
             iconSize: new T.Point(10, 10)
           });
           var for_marker = new T.Marker(for_pion, { icon: forecast_icon });

           ! function (arr) {
             for_marker.addEventListener('click', function () {
               $('.masg-text').html('');
               $('.masg-text').append('<p>' + aData[2] + ' ' + aData[1] + '</p>')
                 .append('<p class="color">' + _tranDate(arr[1]) + '</p>')
                 .append('<p>中心气压：' + arr[4] + '百帕</p>')
                 .append('<p>最大风速：' + arr[5] + '米/秒</p>')
                 .append('<p>未来移向：' + testWind(arr[7]) + '</p>');

               var oPixelPoint = map.lngLatToContainerPoint({ lng: arr[2], lat: arr[3] });
               $('.masg').css({
                 "left": oPixelPoint.x + 'px',
                 "top": oPixelPoint.y + 'px'
               }).show()

               return false;
             })
           }(forecastPiont[for_iNow])

           var for_lable = new T.Label({
             text: '<div>' + tranTime(forecastPiont[for_iNow][1]) + '</div>',
             position: for_pion,
             offset: new T.Point(-5, 0)
           });
           // for_lable.setBackgroundColor('rgba(0,0,0,0)');
           // for_lable.setFontColor('green');
           // for_lable.setBorderLine( 0 );
           // $(for_lable.Iw).css({
           // 'boxShadow':'none',
           // });

           map.addOverLay(for_lable);
           map.addOverLay(for_marker);

           aMarker.push(for_lable);
           aMarker.push(for_marker);
           // oMarkers[ID] = aMarker;


           for_aline.push(for_pion);
           var for_line = new T.Polyline(for_aline, {
             color: 'red',
             weight: 2,
             lineStyle: 'dashed'
           });
           map.addOverLay(for_line);
           aLinePionts.push(for_line)
           // oLine[ID] = aLinePionts;
           for_aline.shift();

           for_iNow++;
           if (for_iNow == forecastPiont.length) {
             clearInterval(forecastTimer);
           }

         }, 300 / forecastPiont)
       }
     }, (300 / aPionts.length))        
  }          
  function _tranDate(data) {
    var obj;
    if (typeof data === 'string') {
      obj = data.substring(0, 4) + '年' + data.substring(4, 6) + '月' + data.substring(6, 8) + '日' + data.substring(8, 10) + '时';
    } else if (typeof data === 'object') {
      var time = data[8][0][1];
      var obj = {};
      obj.sDay = time.substring(0, 4) + '-' + time.substring(4, 6) + '-' + time.substring(6, 8);
      obj.time = time.substring(4, 6) + '月' + time.substring(6, 8) + '日' + time.substring(8, 10) + '时';
      obj.name = data[2] + ' ' + data[1];
    }
    return obj;
  }
  //判断台风类型
  function _typhoonType(type) {
    var obj = {};
    obj.photoSrc = 'img/tflj/tf_';
    obj.lineStyle = 'solid';
    obj.isTrue = false;
    switch (type) {
      case 'TD':
        obj.photoSrc += 'rddy.png';
        break;
      case 'TS':
        obj.photoSrc += 'rdfb.png';
        break;
      case 'STS':
        obj.photoSrc += 'qrdfb.png';
        break;
      case 'TY':
        obj.photoSrc += 'tf.png';
        break;
      case 'STY':
        obj.photoSrc += 'qtf.png';
        break;
      case 'SuperTY':
        obj.photoSrc += 'cqtf.png';
        break;
      default:
        obj.photoSrc += 'default.png';
        obj.lineStyle = 'dashed';
        obj.isTrue = true;
        break;
    }
    return obj;
  }
  function tranTime(str) {
    return str.substring(4, 6) + '月' + str.substring(6, 8) + '日' + str.substring(8, 10) + '时';
  }
}
$('.closeMask').click(function () {
  $(this).parent().parent().hide()
  clearInterval(timer2)
})

function gggg(myData) {
 
  //地图
  map.clearOverLays();
  $('.loading_tip').fadeOut();
  preView(myData)
  function preView(myData) {
    var oTime = {};
    var oMarkers = {};
    var oLine = {};
    var aLunar = []; //风圈；
    var oMaxWindSpeed = {}; //风速
    $('.loading_tip').show();
    addTyphoon(myData);
    function addTyphoon(myData) {
       $('.loading_tip').hide();
       var aData = myData.typhoon;
       var oDay = _tranDate(aData); //台风开始时间
       var allPionts = aData[8];

       var forecastPiont = []; //预测点
       for (var i = 0; i < allPionts.length; i++) {
         if (allPionts[i][11]) {
           forecastPiont = allPionts[i][11].BABJ;
         }
       }

       var aMarker = [], //所有标记点
         aLine = [], //两点划线用 
         aLinePionts = [], //所有线的点
         aMaxWindSpeed = [], //所有点的风速
         aLastPiont = [], //定旋转团点
         aLastTime = []; //台风最后时间

       // $('.content>h2').html(oDay.name + '（第' + aData[3] + '号台风）').show();

       var latlng = new T.LngLat(allPionts[0][4], allPionts[0][5]);
       var infoWin = new T.InfoWindow();
       infoWin.setLngLat(latlng);
       //设置信息窗口要显示的内容
       infoWin.setContent(aData[2] + ' ' + aData[1]);
       //向地图上添加信息窗口
       aLinePionts.push(infoWin);
       map.addOverLay(infoWin);


       var aPionts = []; //点的经纬度
       var LENG = allPionts.length;
       for (var i = 0; i < LENG; i++) {
         var obj = {};
         obj.lng = allPionts[i][4];
         obj.lat = allPionts[i][5];
         aPionts.push(obj);
         aMaxWindSpeed.push([allPionts[i][9], allPionts[i][1]]);

       }
       // oMaxWindSpeed[ID] = aMaxWindSpeed;
       //设置地图中心点
       map.centerAndZoom(new T.LngLat(aPionts[0].lng, aPionts[0].lat), zoom);

       var iNow = 0,
       index = null;
       var timer = setInterval(function () {
         var pion = new T.LngLat(aPionts[iNow].lng, aPionts[iNow].lat);
         var iconObj = _typhoonType(allPionts[iNow][3]);
         var icon = new T.Icon({
           iconUrl: iconObj.photoSrc,
           iconSize: new T.Point(10, 10)
         });

         if (iconObj.isTrue) {
           aLastPiont.push(new T.LngLat(aPionts[iNow - 1].lng, aPionts[iNow - 1].lat))
           aLastTime.push(_tranDate(allPionts[iNow - 1][1]));
           iconObj.isTrue = false;
         }

         var marker = new T.Marker(pion, { icon: icon });

         ! function (index) {

           marker.addEventListener('click', function () {
             var aPiont = allPionts[index];

             var _thisPiont = new T.LngLat(aPiont[4], aPiont[5]);
             $('.masg-text').html('');
             $('.masg-text').append('<p>' + aData[2] + ' ' + aData[1] + '</p>')
               .append('<p class="color">' + _tranDate(aPiont[1]) + '</p>')
               .append('<p>中心气压：' + aPiont[6] + '百帕</p>')
               .append('<p>最大风速：' + aPiont[7] + '米/秒</p>')
               .append('<p>未来移向：' + testWind(aPiont[8]) + '</p>');

             if (aPiont[10].length) { //有风圈信息

               if (aLunar.length) {
                 for (var i = 0; i < aLunar.length; i++) {
                   map.removeOverLay(aLunar[i]);
                 }
                 aLunar = [];
               }
               $('.masg-text').append('<p>7级风圈半径：' + aPiont[10][0][1] + '</p>')
               var icon7 = new T.Icon({
                 iconUrl: 'img/tflj/fq_7j.png',
                 iconSize: new T.Point(40, 40)
               });
               var marker7 = new T.Marker(_thisPiont, { icon: icon7 });
               aLunar.push(marker7);
               map.addOverLay(marker7);

               if (aPiont[10][1]) {
                 $('.masg-text').append('<p>10级风圈半径：' + aPiont[10][1][1] + '</p>')
                 var icon10 = new T.Icon({
                   iconUrl: 'img/tflj/fq_10j.png',
                   iconSize: new T.Point(60, 60)
                 });
                 var marker10 = new T.Marker(_thisPiont, { icon: icon10 });
                 aLunar.push(marker10);
                 map.addOverLay(marker10);
               }
             }
             var oPixelPoint = map.lngLatToContainerPoint({ lng: aPiont[4], lat: aPiont[5] });
             $('.masg').css({
               "left": oPixelPoint.x + 'px',
               "top": oPixelPoint.y + 'px'
             }).show()

             return false
           });
         }(iNow)

         aMarker.push(marker);
         map.addOverLay(marker);
         // oMarkers[ID] = aMarker;

         if (aLine.length >= 2) { aLine.shift() }
         aLine.push(pion);
         var line = new T.Polyline(aLine, {
           color: 'red',
           weight: 2,
           lineStyle: iconObj.lineStyle
         });
         map.addOverLay(line);
         aLinePionts.push(line)
         // oLine[ID] = aLinePionts;

         iNow++;
         if (iNow == aPionts.length) {
           clearInterval(timer)
           var label = new T.Label({
             // text: aData[2] + '（' + ( aLastTime[0] ? aLastTime[0] : _tranDate(allPionts[ iNow-1 ][1]) ) +'）',
             text: '最新位置：' + (aLastTime[0] ? aLastTime[0] : tranTime(allPionts[iNow - 1][1])) + '<div class="trigon"></div>',
             position: aLastPiont[0] ? aLastPiont[0] : pion,
             offset: new T.Point(-sourceSize * 10, 0)
           });
           label.addEventListener('click', function () {
             $('#curve').stop().show().animate({
               'right': '18.5rem'
             })
             // initEcharts(oMaxWindSpeed[ID], oDay);

             return false;
           })

           //创建地图文本对象
           map.addOverLay(label);
           aMarker.push(label);

           var icon = new T.Icon({
             iconUrl: 'img/tflj/台风.png',
             iconSize: new T.Point(26, 30)
           });
           var marker = new T.Marker(aLastPiont[0] ? aLastPiont[0] : pion, { icon: icon, zIndexOffset: -500 });
           aMarker.push(marker);
           // oMarkers[ID] = aMarker;
           map.addOverLay(marker);

           $('img[src="img/tflj/台风.png"]').css({
             "transformOrigin": '13px 15px 0',
           })

           // 旋转点
           var n = 0;
           setTimeout(function () {
            timer2 = setInterval(function () {
               var transfrom = $(marker.Ir).get(0).style.transform;
               n -= 2;
               if (n <= -20) { n = -30 };
               $(marker.Ir).css('transform', '');
               $(marker.Ir).css('transform', transfrom + ' rotate(' + n + 'deg)');
             }, 60)
             // oTime[ID] = timer2;
           }, 200);

           //预测点

           var for_aline = [];
           for_aline.push(aLastPiont[0] ? aLastPiont[0] : pion);

           var for_iNow = 0;
           var forecastTimer = setInterval(function () {
             var for_pion = new T.LngLat(forecastPiont[for_iNow][2], forecastPiont[for_iNow][3]);
             var iconObj = _typhoonType(forecastPiont[for_iNow][7]);
             var forecast_icon = new T.Icon({
               iconUrl: iconObj.photoSrc,
               iconSize: new T.Point(10, 10)
             });
             var for_marker = new T.Marker(for_pion, { icon: forecast_icon });

             ! function (arr) {
               for_marker.addEventListener('click', function () {
                 $('.masg-text').html('');
                 $('.masg-text').append('<p>' + aData[2] + ' ' + aData[1] + '</p>')
                   .append('<p class="color">' + _tranDate(arr[1]) + '</p>')
                   .append('<p>中心气压：' + arr[4] + '百帕</p>')
                   .append('<p>最大风速：' + arr[5] + '米/秒</p>')
                   .append('<p>未来移向：' + testWind(arr[7]) + '</p>');

                 var oPixelPoint = map.lngLatToContainerPoint({ lng: arr[2], lat: arr[3] });
                 $('.masg').css({
                   "left": oPixelPoint.x + 'px',
                   "top": oPixelPoint.y + 'px'
                 }).show()

                 return false;
               })
             }(forecastPiont[for_iNow])

             var for_lable = new T.Label({
               text: '<div>' + tranTime(forecastPiont[for_iNow][1]) + '</div>',
               position: for_pion,
               offset: new T.Point(-5, 0)
             });
             // for_lable.setBackgroundColor('rgba(0,0,0,0)');
             // for_lable.setFontColor('green');
             // for_lable.setBorderLine( 0 );
             // $(for_lable.Iw).css({
             // 'boxShadow':'none',
             // });

             map.addOverLay(for_lable);
             map.addOverLay(for_marker);

             aMarker.push(for_lable);
             aMarker.push(for_marker);
             // oMarkers[ID] = aMarker;


             for_aline.push(for_pion);
             var for_line = new T.Polyline(for_aline, {
               color: 'red',
               weight: 2,
               lineStyle: 'dashed'
             });
             map.addOverLay(for_line);
             aLinePionts.push(for_line)
             // oLine[ID] = aLinePionts;
             for_aline.shift();

             for_iNow++;
             if (for_iNow == forecastPiont.length) {
               clearInterval(forecastTimer);
             }

           }, 300 / forecastPiont)
         }
       }, (300 / aPionts.length))        
    }          
    function _tranDate(data) {
      var obj;
      if (typeof data === 'string') {
        obj = data.substring(0, 4) + '年' + data.substring(4, 6) + '月' + data.substring(6, 8) + '日' + data.substring(8, 10) + '时';
      } else if (typeof data === 'object') {
        var time = data[8][0][1];
        var obj = {};
        obj.sDay = time.substring(0, 4) + '-' + time.substring(4, 6) + '-' + time.substring(6, 8);
        obj.time = time.substring(4, 6) + '月' + time.substring(6, 8) + '日' + time.substring(8, 10) + '时';
        obj.name = data[2] + ' ' + data[1];
      }
      return obj;
    }
    //判断台风类型
    function _typhoonType(type) {
      var obj = {};
      obj.photoSrc = 'img/tflj/tf_';
      obj.lineStyle = 'solid';
      obj.isTrue = false;
      switch (type) {
        case 'TD':
          obj.photoSrc += 'rddy.png';
          break;
        case 'TS':
          obj.photoSrc += 'rdfb.png';
          break;
        case 'STS':
          obj.photoSrc += 'qrdfb.png';
          break;
        case 'TY':
          obj.photoSrc += 'tf.png';
          break;
        case 'STY':
          obj.photoSrc += 'qtf.png';
          break;
        case 'SuperTY':
          obj.photoSrc += 'cqtf.png';
          break;
        default:
          obj.photoSrc += 'default.png';
          obj.lineStyle = 'dashed';
          obj.isTrue = true;
          break;
      }
      return obj;
    }
    function tranTime(str) {
      return str.substring(4, 6) + '月' + str.substring(6, 8) + '日' + str.substring(8, 10) + '时';
    }
  }

}
// 转换时间戳
function timeStamp(str) {
  var year = str.slice(0,4)
  var month = str.slice(4,6)
  var day = str.slice(6,8)
  var hour = str.slice(8,10)
  var minute = str.slice(10,12)
  var result = year+"/"+month+"/"+day+" "+hour+":"+minute
  var date = new Date(result);
  var time1 = date.getTime();
  return time1
}
