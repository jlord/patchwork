"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toughCookie = _interopRequireDefault(require("tough-cookie"));

var _pify = _interopRequireDefault(require("pify"));

var _isAbsoluteURL = _interopRequireDefault(require("axios/lib/helpers/isAbsoluteURL"));

var _combineURLs = _interopRequireDefault(require("axios/lib/helpers/combineURLs"));

var _symbol = require("../symbol");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function requestInterceptor(config, instance) {
  const local = config[_symbol.COOKIEJAR_SUPPORT_LOCAL] || {};
  Object.defineProperty(config, _symbol.COOKIEJAR_SUPPORT_LOCAL, {
    writable: true,
    configurable: true,
    enumerable: true,
    value: local
  });
  local.backupOptions = local.backupOptions || {};

  if (instance.defaults.jar === true) {
    instance.defaults.jar = new _toughCookie.default.CookieJar();
  }

  if (!local.jar) {
    if (config.jar === true) {
      local.jar = instance.defaults.jar || new _toughCookie.default.CookieJar();
    } else if (config.jar === false) {
      local.jar = false;
    } else {
      local.jar = config.jar || instance.defaults.jar;
    }
  } // Redirect Setup


  Object.assign(local, {
    redirectCount: isFinite(config.maxRedirects) ? config.maxRedirects : 5
  });
  Object.assign(local.backupOptions, config, local.backupOptions);
  Object.assign(config, {
    maxRedirects: 0
  });
  delete config.validateStatus; // Cookies Setup

  Object.assign(local, {
    cookieHeader: local.cookieHeader != null ? local.cookieHeader : (config.headers || {})['Cookie'] || ''
  });

  if (local.jar && config.withCredentials) {
    const getCookieString = (0, _pify.default)(local.jar.getCookieString.bind(local.jar));
    const requestUrl = config.baseURL && !(0, _isAbsoluteURL.default)(config.url) ? (0, _combineURLs.default)(config.baseURL, config.url) : config.url;
    const cookieString = await getCookieString(requestUrl);

    if (cookieString) {
      if (config.headers) {
        config.headers['Cookie'] = [local.cookieHeader, cookieString].filter(c => !!c).join(';\x20');
      } else {
        config.headers = {
          Cookie: cookieString
        };
      }
    }
  }

  return config;
}

var _default = requestInterceptor;
exports.default = _default;