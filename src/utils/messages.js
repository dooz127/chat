const generateMessage = (username, text) => ({
  username,
  text,
  createdAt: Date.now()
});

const generateLocationMessage = (username, location) => ({
  username,
  location,
  createdAt: Date.now()
});

module.exports = {
  generateMessage,
  generateLocationMessage
};
