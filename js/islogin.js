var local_username = window.localStorage.getItem('username')
if (!local_username) {
  window.location.replace('login.html')
}else{
  $('#userInfo').val(local_username)
}
