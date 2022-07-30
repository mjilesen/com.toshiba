const axios = require('axios');

axios.interceptors.response.use(null, error => {
  return Promise.reject(error);
});

exports.get = axios.get;
exports.post = axios.post;
exports.axios = axios;
