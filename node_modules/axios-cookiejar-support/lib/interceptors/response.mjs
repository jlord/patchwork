import url from 'url';
import settle from 'axios/lib/core/settle';
import pify from 'pify';
import isRedirect from 'is-redirect';
import { COOKIEJAR_SUPPORT_LOCAL } from '../symbol';

async function responseInterceptor(response, instance) {
  // Set Cookies
  const config = response.config;
  const headers = response.headers;
  const statusCode = response.status;
  const local = config[COOKIEJAR_SUPPORT_LOCAL];

  if (!local) {
    return response;
  }

  if (local.jar && headers['set-cookie']) {
    const setCookie = pify(local.jar.setCookie.bind(local.jar));
    const setCookiePromiseList = [];
    if (Array.isArray(headers['set-cookie'])) {
      const cookies = headers['set-cookie'];
      cookies.forEach(function(cookie) {
        setCookiePromiseList.push(setCookie(cookie, config.url, { ignoreError: config.ignoreCookieErrors }));
      });
    } else {
      const cookie = headers['set-cookie'];
      setCookiePromiseList.push(setCookie(cookie, config.url, { ignoreError: config.ignoreCookieErrors }));
    }
    await Promise.all(setCookiePromiseList);
  }

  // Redirect
  Object.assign(local.backupOptions, config, local.backupOptions);
  delete config.baseURL;
  config.url = url.resolve(config.url, headers['location'] || '');
  local.redirectCount--;

  if (local.redirectCount >= 0 && isRedirect(statusCode) && !!headers['location']) {
    if (response.status !== 307) {
      config.method = 'get';
    }
    config.maxRedirects = local.redirectCount;
    return instance.request(config);
  }

  // Restore
  if (local.backupOptions) {
    Object.assign(config, local.backupOptions);
  }
  if (local.jar) {
    if (instance.defaults.jar && (!config.jar || config.jar === true)) {
      instance.defaults.jar = local.jar;
    }
    config.jar = local.jar;
  }
  delete config[COOKIEJAR_SUPPORT_LOCAL];

  // Validate
  await new Promise(function(resolve, reject) {
    settle(resolve, reject, response);
  });

  return response;
}

export default responseInterceptor;
