module.exports = {
  apps : [
    {
      name: "ngrok",
      script: "C:\\Bot WA\\ngrok.exe",
      args: "http 3000 --log=stdout",
      watch: false,
      autorestart: true
    },
    {
      name: "bot-wa",
      script: "C:\\Bot WA\\newtes.js",
      watch: false,
      autorestart: true
    }
  ]
};