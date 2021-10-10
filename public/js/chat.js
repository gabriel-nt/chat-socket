const socket = io('http://localhost:3000');

function onLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');
  const email = urlParams.get('email');
  const avatar = urlParams.get('avatar');

  document.querySelector('.avatar_user_logged').setAttribute('src', avatar);
  document.querySelector('#user_logged').innerHTML = name;

  socket.emit('start', {
    email,
    name,
    avatar,
  });

  socket.on('new_users', (user) => {
    const existInDiv = document.getElementById(`user_${user._id}`);

    if (!existInDiv) {
      addUser(user);
    }
  });

  socket.emit('get_users', (users) => {
    users.map((user) => {
      if (user.email !== email) {
        addUser(user);
      }
    });
  });
}

function addUser(user) {
  const userList = document.getElementById('users_list');

  userList.innerHTML += `<li
    class="user_name_list"
    id="user_${user._id}"
    idUser="${user._id}"
  >
    <img
      class="nav_avatar"
      src="${user.avatar}"
    />
    ${user.name}
  </li>`;
}

onLoad();
