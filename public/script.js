const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const nicknameInput = document.getElementById('nickname');
const genderSelect = document.getElementById('gender');
const loginBtn = document.getElementById('login-btn');
const usersList = document.getElementById('users-list');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const videoCallBtn = document.getElementById('video-call-btn');

let ws;
let nickname;

loginBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    const gender = genderSelect.value;
    if (nickname) {
        ws = new WebSocket(`ws://${location.host}`);
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'login', nickname, gender }));
            loginContainer.style.display = 'none';
            chatContainer.style.display = 'block';
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'updateUsers':
                    updateUsersList(data.users);
                    break;
                case 'message':
                    addMessage(`${data.nickname}: ${data.message}`);
                    break;
                case 'privateMessage':
                    addMessage(`Private from ${data.from}: ${data.message}`);
                    break;
            }
        };
    }
});

sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        ws.send(JSON.stringify({ type: 'message', nickname, message }));
        messageInput.value = '';
    }
});

videoCallBtn.addEventListener('click', () => {
    // Implement video call functionality here
    alert('Video call feature not implemented yet.');
});

function updateUsersList(users) {
    usersList.innerHTML = '';
    users.forEach((user) => {
        const userElement = document.createElement('div');
        userElement.textContent = user;
        usersList.appendChild(userElement);
    });
}

function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}
