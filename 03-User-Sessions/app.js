window.addEventListener('load', function() {

  var userProfile

  var lock = new Auth0Lock(AUTH_CONFIG.clientID, AUTH_CONFIG.domain, {
    oidcConformant: true,
    autoclose: true,
    auth: {
      redirectUrl: AUTH_CONFIG.callbackURL,
      responseType: 'token id_token',
      audience: 'https://' + AUTH_CONFIG.domain + '/userinfo',
      params: {
        scope: 'openid profile'
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
  var profileView = document.getElementById('profile-view')

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login')
  var logoutBtn = document.getElementById('btn-logout')

  var homeViewBtn = document.getElementById('btn-home-view')
  var profileViewBtn = document.getElementById('btn-profile-view')

  loginBtn.addEventListener('click', login)
  logoutBtn.addEventListener('click', logout)

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block'
    profileView.style.display = 'none'
  })

  profileViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none'
    profileView.style.display = 'inline-block'
    getProfile()
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
      profileViewBtn.style.display = 'inline-block'
      loginStatus.innerHTML = 'You are logged in! You can now view your profile area.'
    } else {
      loginBtn.style.display = 'inline-block'
      logoutBtn.style.display = 'none'
      profileViewBtn.style.display = 'none'
      profileView.style.display = 'none'
      loginStatus.innerHTML = 'You are not logged in! Please log in to continue.'
    }
  }

  function getProfile() {
    if (!userProfile) {
      var accessToken = localStorage.getItem('access_token')

      if (!accessToken) {
        console.log('Access token must exist to fetch profile')
      }

      lock.getUserInfo(accessToken, function (err, profile) {
        if (profile) {
          userProfile = profile
          displayProfile()
        }
      })
    } else {
      displayProfile()
    }
  }

  function displayProfile() {
    // display the profile
    document.querySelector('#profile-view .nickname').innerHTML = userProfile.nickname
    document.querySelector('#profile-view .email').innerHTML = userProfile.email
    document.querySelector('#profile-view .full-profile').innerHTML = JSON.stringify(userProfile, null, 2)
    document.querySelector('#profile-view img').src = userProfile.picture
  }

  displayButtons()

})
