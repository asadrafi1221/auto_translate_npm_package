const readline = require("readline");

let rl = null;

const createReadlineInterface = () => {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
};

const askQuestion = (question) => {
  const interface = createReadlineInterface();
  return new Promise((resolve) => {
    interface.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const closeReadline = () => {
  if (rl) {
    rl.close();
    rl = null;
  }
};

module.exports = {
  createReadlineInterface,
  askQuestion,
  closeReadline,
};