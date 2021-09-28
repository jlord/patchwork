"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defaults = _interopRequireDefault(require("axios/lib/defaults"));

var _dispatchRequest = _interopRequireDefault(require("axios/lib/core/dispatchRequest"));

var _isAbsoluteURL = _interopRequireDefault(require("axios/lib/helpers/isAbsoluteURL"));

var _combineURLs = _interopRequireDefault(require("axios/lib/helpers/combineURLs"));

var _request = _interopRequireDefault(require("./interceptors/request"));

var _response = _interopRequireDefault(require("./interceptors/response"));

var _symbol = require("./symbol");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mergeConfig = (() => {
  try {
    // For v0.19.x
    return require('axios/lib/core/mergeConfig');
  } catch (_err) {
    return require('axios/lib/utils').merge;
  }
})(); // For v0.16.x

/** @param {import('axios').AxiosRequestConfig} config */


const wrappedDispatchRequest = config => {
  if (config.baseURL && !(0, _isAbsoluteURL.default)(config.url)) {
    config.url = (0, _combineURLs.default)(config.baseURL, config.url);
  }

  return (0, _dispatchRequest.default)(config);
};
/** @param {import('axios').AxiosInstance} instance */


function overwriteRequestFunction(instance) {
  instance.request = function request(...args) {
    const config = {};

    if (typeof args[0] === 'string') {
      Object.assign(config, args[1], {
        url: args[0]
      });
    } else {
      Object.assign(config, args[0]);
    }

    const mergedConfig = mergeConfig(_defaults.default, mergeConfig(this.defaults, config));
    mergedConfig.jar = config.jar != null ? config.jar : this.defaults.jar;
    mergedConfig.method = (mergedConfig.method || 'get').toLowerCase();
    mergedConfig[_symbol.COOKIEJAR_SUPPORT_LOCAL] = config[_symbol.COOKIEJAR_SUPPORT_LOCAL];
    const chain = [[wrappedDispatchRequest, undefined]];
    this.interceptors.request.forEach(interceptor => {
      chain.unshift([interceptor.fulfilled, interceptor.rejected]);
    });
    this.interceptors.response.forEach(interceptor => {
      chain.push([interceptor.fulfilled, interceptor.rejected]);
    });
    return chain.reduce((promise, [fullfilled, rejected]) => promise.then(fullfilled, rejected), Promise.resolve(mergedConfig));
  };

  ['delete', 'get', 'head', 'options'].forEach(method => {
    instance[method] = function (url, config = {}) {
      return this.request(Object.assign(config, {
        method,
        url
      }));
    };
  });
  ['post', 'put', 'patch'].forEach(method => {
    instance[method] = function (url, data, config = {}) {
      return this.request(Object.assign(config, {
        method,
        url,
        data
      }));
    };
  });
}

function axiosCookieJarSupport(instance) {
  // Wrap instance when creating new instance.
  if (instance.create) {
    const createInstance = instance.create.bind(instance);

    instance.create = function create(defaultConfig = {}) {
      const newInstance = createInstance(defaultConfig);
      Object.defineProperty(newInstance.defaults, 'jar', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: defaultConfig.jar != null ? defaultConfig.jar : instance.defaults.jar
      });
      return axiosCookieJarSupport(newInstance);
    };
  } // Skip if already wrapped


  if (instance[_symbol.COOKIEJAR_SUPPORTED]) {
    return instance;
  }

  Object.defineProperty(instance, _symbol.COOKIEJAR_SUPPORTED, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: true
  }); // Prevent utils.merge for defaults.jar

  Object.defineProperty(instance.defaults, 'jar', {
    configurable: false,
    enumerable: false,
    writable: true,
    value: instance.defaults.jar
  }); // Overwirte request function

  overwriteRequestFunction(instance); // Add interceptors

  instance.interceptors.request.use(res => (0, _request.default)(res, instance));
  instance.interceptors.response.use(res => (0, _response.default)(res, instance));
  return instance;
}

var _default = axiosCookieJarSupport;
exports.default = _default;