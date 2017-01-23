window.addEventListener('load', function() {

  var apiUrl = 'http://localhost:3001/api'

  var lock = new Auth0Lock(AUTH_CONFIG.clientID, AUTH_CONFIG.domain, {
    oidcConformant: true,
    autoclose: true,
    auth: {
      redirectUrl: AUTH_CONFIG.callbackURL,
      responseType: 'token id_token',
      audience: AUTH_CONFIG.apiUrl,
      params: {
        scope: 'openid read:messages'
      }
    }
  })

  lock.on('authenticated', function(authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setUser(authResult)
    } else if (authResult && authResult.error) {
      alert('Error: ' + authResult.error)
    }
    displayButtons()
  })

  var homeView = document.getElementById('home-view')
  var pingView = document.getElementById('ping-view')
  var adminView = document.getElementById('admin-view')

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login')
  var logoutBtn = document.getElementById('btn-logout')

  var homeViewBtn = document.getElementById('btn-home-view')
  var pingViewBtn = document.getElementById('btn-ping-view')
  var adminViewBtn = document.getElementById('btn-admin-view')

  var pingPublic = document.getElementById('btn-ping-public')
  var pingPrivate = document.getElementById('btn-ping-private')

  pingPublic.addEventListener('click', function() {
    callAPI('/public', false)
  })

  pingPrivate.addEventListener('click', function() {
    callAPI('/private', true)
  })

  loginBtn.addEventListener('click', login)
  logoutBtn.addEventListener('click', logout)

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block'
    adminView.style.display = 'none'
    pingView.style.display = 'none'
  })

  pingViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none'
    adminView.style.display = 'none'
    pingView.style.display = 'inline-block'
  })

  adminViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none'
    pingView.style.display = 'none'
    adminView.style.display = 'inline-block'
    var idToken = jwt_decode(localStorage.getItem('id_token'))
    adminView.querySelector('pre').innerHTML = JSON.stringify(idToken, null, 2)
  })

  function login() {
    lock.show()
  }

  function logout() {
    // Remove token from localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    displayButtons()
  }

  function isAuthenticated() {
    // return tokenNotExpired()
    // need JS helper library - for now we'll assume they're logged in if they
    // have an `access_token` and `id_token` in their localStorage
    return localStorage['id_token'] && localStorage['access_token']
  }

  function setUser(authResult) {
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
  }

  function displayButtons() {
    var loginStatus = document.querySelector('.container h4')
    if (isAuthenticated()) {
      loginBtn.style.display = 'none'
      logoutBtn.style.display = 'inline-block'
      loginStatus.innerHTML = 'You are logged in!'
      if (isAdmin()){
        adminViewBtn.style.display = 'inline-block'
      } else {
        adminViewBtn.style.display = 'none'
      }
    } else {
      loginBtn.style.display = 'inline-block'
      logoutBtn.style.display = 'none'
      adminViewBtn.style.display = 'none'
      adminView.style.display = 'none'
      loginStatus.innerHTML = 'You are not logged in! Please log in to continue.'
    }
  }

  function callAPI(endpoint, secured) {
    var url = apiUrl + endpoint
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    if (secured) {
      xhr.setRequestHeader('Authorization',
                           'Bearer ' + localStorage.getItem('access_token'))
    }
    xhr.onload = function() {
      if (xhr.status == 200) {
        document.querySelector('#ping-view h2').innerHTML =
          JSON.parse(xhr.responseText).message
      } else {
        alert("Request failed: " + xhr.statusText)
      }
    }
    xhr.send()
  }

  function getRole() {
    var namespace = 'https://example.com'
    var idToken = localStorage.getItem('id_token')
    return jwt_decode(idToken)[namespace + '/role'] || null
  }

  function isAdmin() {
    return getRole() === 'admin'
  }

  displayButtons()

})
