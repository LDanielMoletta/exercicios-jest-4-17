function createEmailSender(apiSend) {
  return function sendEmail(user) {
    return apiSend(user.email, 'Bem-vindo!');
  };
}

module.exports = { createEmailSender };
