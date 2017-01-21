window.addEventListener('load', function() {

  var lock = new Auth0Lock(AUTH_CONFIG.clientID, AUTH_CONFIG.domain, {
    oidcConformant: true,
    autoclose: true,
    auth: {
      redirectUrl: AUTH_CONFIG.callbackURL,
      responseType: 'token id_token',
      audience: 'https://' + AUTH_CONFIG.domain + '/userinfo',
      params: {
        scope: 'openid'
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

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login')
  var logoutBtn = document.getElementById('btn-logout')

  loginBtn.addEventListener('click', login)
  logoutBtn.addEventListener('click', logout)

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
    } else {
      loginBtn.style.display = 'inline-block'
      logoutBtn.style.display = 'none'
      loginStatus.innerHTML = 'You are not logged in! Please log in to continue.'
    }
  }

  displayButtons()

})
