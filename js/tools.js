function getJSON(url,method,dataType,callback){
  $.ajax({
    url: url,
    type: method,
    dataType: dataType,
    success: function (data) {
      callback(data)
    }
  });
}
function formatDate(date){
  var year = date.substr(0,4)
  var month = date.substr(4,2)
  var day = date.substr(6,2)
  var hour = date.substr(8,2)
  var minute = date.substr(10,2)
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute
}
