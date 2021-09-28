import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';

declare module 'axios' {
  export interface AxiosRequestConfig {
    jar?: CookieJar | boolean;
  }
}

declare var axiosCookieJarSupport: (instance: AxiosInstance) => AxiosInstance;
export default axiosCookieJarSupport;
