const socket = io('http://localhost:3000');
let idChatRoom = '';

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

    if (!existInDiv && user.email !== email) {
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

  socket.on('message', (data) => {
    if (data.message.roomId === idChatRoom) {
      addMessage(data);
    }
  });

  socket.on('notification', (data) => {
    if (data.roomId !== idChatRoom) {
      const user = document.getElementById(`user_${data.from._id}`);

      user.insertAdjacentHTML(`afterbegin`, `<div class"notification"></div>`);
    }
  });
}

function addMessage(data) {
  const divMessageUser = document.getElementById('message_user');

  divMessageUser.innerHTML += `
  <span class="user_name user_name_date">
    <img
      class="img_user"
      src="${data.user.avatar}"
    />
    <strong>${data.user.name}</strong>
    &nbsp;
    <span>${dayjs(data.message.created_at).format('DD/MM/YYYY HH:mm')}</span>
  </span>
  <div class="messages">
    <span class="chat_message">${data.message.text}</span>
  </div>
  `;
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

document.getElementById('users_list').addEventListener('click', (event) => {
  document.getElementById('message_user').innerHTML = '';
  document
    .querySelectorAll('li.user_name_list')
    .forEach((item) => item.classList.remove('user_in_focus'));

  if (event.target && event.target.matches('li.user_name_list')) {
    const idUser = event.target.getAttribute('idUser');

    event.target.classList.add('user_in_focus');

    const notification = document.querySelector(
      `#user_${idUser} .notification`
    );
    notification && notification.remove();

    document.getElementById('user_message').classList.remove('hidden');
    document.getElementById('send_message').classList.remove('hidden');

    socket.emit(
      'start_chat',
      {
        idUser,
      },
      (data) => {
        idChatRoom = data.room.idChatRoom;
        data.messages.forEach((message) => {
          const data = {
            message,
            user: message.to,
          };

          addMessage(data);
        });
      }
    );
  }
});

document.getElementById('send_message').addEventListener('click', (event) => {
  const message = document.getElementById('user_message').value;

  if (message) {
    const data = {
      message,
      idChatRoom,
    };

    socket.emit('message', data);

    document.getElementById('user_message').value = '';
  }
});

document
  .getElementById('user_message')
  .addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const message = event.target.value;

      if (message) {
        const data = {
          message,
          idChatRoom,
        };

        socket.emit('message', data);

        event.target.value = '';
      }
    }
  });

onLoad();
