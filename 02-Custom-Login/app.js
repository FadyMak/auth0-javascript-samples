window.addEventListener('load', function() {

  var loginStatus = document.querySelector('.container h4')
  var loginView = document.getElementById('login-view')
  var homeView = document.getElementById('home-view')

  var webAuth = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientID,
    redirectUri: AUTH_CONFIG.callbackURL,
    audience: 'https://' + AUTH_CONFIG.domain + '/userinfo',
    responseType: 'token id_token'
  })

  // buttons and event listeners
  var homeViewBtn = document.getElementById('btn-home-view')
  var loginViewBtn = document.getElementById('btn-login-view')
  var logoutBtn = document.getElementById('btn-logout')

  var loginBtn = document.getElementById('btn-login')
  var signupBtn = document.getElementById('btn-signup')
  var googleLoginBtn = document.getElementById('btn-google-login')

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block'
    loginView.style.display = 'none'
  })

  loginViewBtn.addEventListener('click', function() {
    loginView.style.display = 'inline-block'
    homeView.style.display = 'none'
  })

  signupBtn.addEventListener('click', function() {
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    signup(email, password)
  })

  loginBtn.addEventListener('click', function() {
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    login(email, password)
  })


  logoutBtn.addEventListener('click', logout)
  googleLoginBtn.addEventListener('click', loginWithGoogle)

  function login(username, password) {
    webAuth.client.login({
      realm: 'Username-Password-Authentication',
      username: username,
      password: password
    }, function (err, data) {
      if (err) {
        console.log(err)
        return
      }
      setUser(data)
      loginView.style.display = 'none'
      homeView.style.display = 'inline-block'
      displayButtons()
    })
  }

  function signup(email, password) {
    webAuth.redirect.signupAndLogin({
      connection: 'Username-Password-Authentication',
      email: email,
      password: password,
    }, function(err) {
      if (err) {
        console.log(err)
      }
    })
  }

  function loginWithGoogle() {
    webAuth.authorize({
      connection: 'google-oauth2',
    }, function(err) {
      if (err) {
        console.log('Error:' + err)
      }
    })
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
    if (isAuthenticated()) {
      loginViewBtn.style.display = 'none'
      logoutBtn.style.display = 'inline-block'
      loginStatus.innerHTML = 'You are logged in!'
    } else {
      loginViewBtn.style.display = 'inline-block'
      logoutBtn.style.display = 'none'
      loginStatus.innerHTML = 'You are not logged in! Please log in to continue.'
    }
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = ''
        setUser(authResult)
        loginView.style.display = 'none'
        homeView.style.display = 'inline-block'
      } else if (authResult && authResult.error) {
        alert('Error: ' + authResult.error)
      }
      displayButtons()
    })
  }

  handleAuthentication()

})
