import tough from 'tough-cookie';
import pify from 'pify';
import isAbsoluteURL from 'axios/lib/helpers/isAbsoluteURL';
import combineURLs from 'axios/lib/helpers/combineURLs';
import { COOKIEJAR_SUPPORT_LOCAL } from '../symbol';

async function requestInterceptor(config, instance) {
  const local = config[COOKIEJAR_SUPPORT_LOCAL] || {};
  Object.defineProperty(config, COOKIEJAR_SUPPORT_LOCAL, {
    writable: true,
    configurable: true,
    enumerable: true,
    value: local,
  });
  local.backupOptions = local.backupOptions || {};

  if (instance.defaults.jar === true) {
    instance.defaults.jar = new tough.CookieJar();
  }
  if (!local.jar) {
    if (config.jar === true) {
      local.jar = instance.defaults.jar || new tough.CookieJar();
    } else if (config.jar === false) {
      local.jar = false;
    } else {
      local.jar = config.jar || instance.defaults.jar;
    }
  }

  // Redirect Setup
  Object.assign(local, {
    redirectCount: isFinite(config.maxRedirects) ? config.maxRedirects : 5,
  });
  Object.assign(local.backupOptions, config, local.backupOptions);
  Object.assign(config, {
    maxRedirects: 0,
  });
  delete config.validateStatus;

  // Cookies Setup
  Object.assign(local, {
    cookieHeader: local.cookieHeader != null ? local.cookieHeader : (config.headers || {})['Cookie'] || '',
  });
  if (local.jar && config.withCredentials) {
    const getCookieString = pify(local.jar.getCookieString.bind(local.jar));
    const requestUrl =
      config.baseURL && !isAbsoluteURL(config.url) ? combineURLs(config.baseURL, config.url) : config.url;
    const cookieString = await getCookieString(requestUrl);
    if (cookieString) {
      if (config.headers) {
        config.headers['Cookie'] = [local.cookieHeader, cookieString].filter((c) => !!c).join(';\x20');
      } else {
        config.headers = { Cookie: cookieString };
      }
    }
  }

  return config;
}

export default requestInterceptor;
