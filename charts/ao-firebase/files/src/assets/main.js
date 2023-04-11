const uidElement = document.querySelector('#uid');
const usernameElement = document.querySelector('#username');
const orgElement = document.querySelector('#organization');

const logout = () => (window.location.href = '/login');

const refreshUserData = user => {
  if (user) {
    usernameElement.innerText = user.email;
    uidElement.innerText = user.uid;
  } else {
    logout();
  }
};

const getNewToken = user => user.getIdTokenResult(false);

const getOrg = token =>
  fetch('/api/userinfo', {
    headers: { authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Something went wrong.');
      }

      return res.json();
    })
    .then(data => {
      orgElement.innerHTML = data.orgName;
    })
    .catch(() => logout());

const onLoad = user => {
  refreshUserData(user);

  if (user) {
    return getNewToken(user)
      .then(({ token }) => getOrg(token))
      .catch(() => logout());
  }
};

if (firebase.auth().onIdTokenChanged) {
  firebase.auth().onIdTokenChanged(onLoad);
}

firebase.auth().onAuthStateChanged(user => refreshUserData(user));
