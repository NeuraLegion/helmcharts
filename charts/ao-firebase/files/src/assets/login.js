const login = (email, password) =>
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => (window.location.href = '/'))
    .catch(err => {
      const emsg = document.querySelector('.emsg');
      emsg.innerText = err.message;
    });

const form = document.querySelector('form');

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new URLSearchParams(new FormData(form));
  const email = data.get('username');
  const password = data.get('password');
  login(email, password);
});
