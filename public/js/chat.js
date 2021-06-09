const socket = io();

// HTML elements
const $messageForm = document.querySelector('#msgForm');
const $messageFormInput = document.querySelector('#userMsg');
const $messageFormBtn = document.querySelector('#btn-submit');
const $locationBtn = document.querySelector('#btn-location');
const $messages = document.querySelector('#messages');

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate =
  document.querySelector('#location-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  // get latest message
  const $latestMsg = $messages.lastElementChild;

  // get height of latest message
  const latestMsgStyles = getComputedStyle($latestMsg);
  const latestMsgMargin = parseInt(latestMsgStyles.marginBottom);
  const latestMsgHeight = $latestMsg.offsetHeight + latestMsgMargin;

  // get visible height
  const visibleHeight = $messages.offsetHeight;

  // get height of messages container
  const containerHeight = $messages.scrollHeight;

  // determine how far user has scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - latestMsgHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }

  console.log(latestMsgStyles);
  console.log(latestMsgHeight);
};

socket.on('message', (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render($locationTemplate, {
    username: message.username,
    location: message.location,
    createdAt: moment(message.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  });

  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // disable submit button on send
  $messageFormBtn.setAttribute('disabled', 'disabled');

  const userMsg = document.querySelector('#userMsg');
  const message = userMsg.value;

  socket.emit('sendMessage', message, (error) => {
    // enable submit button on server acknowledgment
    $messageFormBtn.removeAttribute('disabled');

    // clear message and set focus to input
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }
    console.log('The message was delivered!');
  });
});

$locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  $locationBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const long = position.coords.longitude;
    const lat = position.coords.latitude;

    socket.emit('sendLocation', { long, lat }, () => {
      // enable location button on server acknowledgment
      $locationBtn.removeAttribute('disabled');

      console.log('Location shared!');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
