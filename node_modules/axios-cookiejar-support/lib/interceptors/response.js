"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _url = _interopRequireDefault(require("url"));

var _settle = _interopRequireDefault(require("axios/lib/core/settle"));

var _pify = _interopRequireDefault(require("pify"));

var _isRedirect = _interopRequireDefault(require("is-redirect"));

var _symbol = require("../symbol");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function responseInterceptor(response, instance) {
  // Set Cookies
  const config = response.config;
  const headers = response.headers;
  const statusCode = response.status;
  const local = config[_symbol.COOKIEJAR_SUPPORT_LOCAL];

  if (!local) {
    return response;
  }

  if (local.jar && headers['set-cookie']) {
    const setCookie = (0, _pify.default)(local.jar.setCookie.bind(local.jar));
    const setCookiePromiseList = [];

    if (Array.isArray(headers['set-cookie'])) {
      const cookies = headers['set-cookie'];
      cookies.forEach(function (cookie) {
        setCookiePromiseList.push(setCookie(cookie, config.url, {
          ignoreError: config.ignoreCookieErrors
        }));
      });
    } else {
      const cookie = headers['set-cookie'];
      setCookiePromiseList.push(setCookie(cookie, config.url, {
        ignoreError: config.ignoreCookieErrors
      }));
    }

    await Promise.all(setCookiePromiseList);
  } // Redirect


  Object.assign(local.backupOptions, config, local.backupOptions);
  delete config.baseURL;
  config.url = _url.default.resolve(config.url, headers['location'] || '');
  local.redirectCount--;

  if (local.redirectCount >= 0 && (0, _isRedirect.default)(statusCode) && !!headers['location']) {
    if (response.status !== 307) {
      config.method = 'get';
    }

    config.maxRedirects = local.redirectCount;
    return instance.request(config);
  } // Restore


  if (local.backupOptions) {
    Object.assign(config, local.backupOptions);
  }

  if (local.jar) {
    if (instance.defaults.jar && (!config.jar || config.jar === true)) {
      instance.defaults.jar = local.jar;
    }

    config.jar = local.jar;
  }

  delete config[_symbol.COOKIEJAR_SUPPORT_LOCAL]; // Validate

  await new Promise(function (resolve, reject) {
    (0, _settle.default)(resolve, reject, response);
  });
  return response;
}

var _default = responseInterceptor;
exports.default = _default;