const cors_proxy = require('cors-anywhere');

const host = 'localhost';
const port = 8081;

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2'],
}).listen(port, host, function () {
  console.log('CORS Anywhere is running on ' + host + ':' + port);
});
