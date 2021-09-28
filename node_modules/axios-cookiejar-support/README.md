# axios-cookiejar-support

Add [``tough-cookie``] support to [``axios``].

[``axios``]: https://github.com/mzabriskie/axios
[``tough-cookie``]: https://github.com/SalesforceEng/tough-cookie

---

[![NPM][npm-badge]][npm]
[![LICENSE][license-badge]][license]
[![CircleCI][circleci-badge]][circleci]

[![dependencies][dependencies-badge]][dependencies-david]
[![peerdependencies][peerdependencies-badge]][peerdependencies-david]
[![devdependencies][devdependencies-badge]][devdependencies-david]

[npm]: https://www.npmjs.com/package/axios-cookiejar-support
[license]: https://3846masa.mit-license.org
[circleci]: https://circleci.com/gh/3846masa/axios-cookiejar-support
[dependencies-david]: https://david-dm.org/3846masa/axios-cookiejar-support
[peerdependencies-david]: https://david-dm.org/3846masa/axios-cookiejar-support
[devdependencies-david]: https://david-dm.org/3846masa/axios-cookiejar-support
[npm-badge]: https://flat.badgen.net/npm/v/axios-cookiejar-support?icon=npm
[license-badge]: https://flat.badgen.net/badge/license/MIT/blue
[circleci-badge]: https://flat.badgen.net/circleci/github/3846masa/axios-cookiejar-support?icon=circleci
[dependencies-badge]: https://flat.badgen.net/david/dep/3846masa/axios-cookiejar-support
[peerdependencies-badge]: https://flat.badgen.net/david/peer/3846masa/axios-cookiejar-support
[devdependencies-badge]: https://flat.badgen.net/david/dev/3846masa/axios-cookiejar-support

## Install

```sh
$ npm i axios tough-cookie axios-cookiejar-support
```

**-- OR --**

```sh
$ npm i axios tough-cookie @3846masa/axios-cookiejar-support # Same as above
```

### TypeScript

If you want to use it with TypeScript, add `@types/tough-cookie`.

```sh
npm i @types/tough-cookie
```

## Usage

```js
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();

axios
  .get('https://google.com', {
    jar: cookieJar, // tough.CookieJar or boolean
    withCredentials: true, // If true, send cookie stored in jar
  })
  .then(() => {
    console.log(cookieJar);
  });
```

See [examples](./example).

### Notice: Set default cookiejar

`axios@>=0.19.0` cannot assign `defaults.jar` via `axios.create()` before wrapping instance.
When you want to set `defaults.jar`, please set directly after wrapping instance.

```js
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

const instance = axios.create({
  // WARNING: This value will be ignored.
  jar: new tough.CookieJar(),
});

// Set directly after wrapping instance.
axiosCookieJarSupport(instance);
instance.defaults.jar = new tough.CookieJar();
```

### Extended Request Config

c.f.) https://github.com/mzabriskie/axios#request-config

```js
{
  // `jar` is tough.CookieJar instance or boolean.
  // If true, axios create CookieJar automatically.
  jar: undefined, // default

  // Silently ignore things like parse cookie errors and invalid domains.
  // See also https://github.com/salesforce/tough-cookie
  ignoreCookieErrors: false // default

  // **IMPORTANT**
  // If false, axios DONOT send cookies from cookiejar.
  withCredentials: false // default
}
```

### Browser

Running on browser, this library becomes noop (`config.jar` might be ignored).

## Contribution

1. [Fork it]
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

[fork it]: http://github.com/3846masa/axios-cookiejar-support/fork

## LICENSE

[MIT License](https://3846masa.mit-license.org)

## Author

![3846masa icon][3846masa-icon]
[3846masa](https://github.com/3846masa)

[3846masa-icon]: https://www.gravatar.com/avatar/cfeae69aae4f4fc102960f01d35d2d86?s=50

---

## Donate

[Paypal.me](https://www.paypal.me/3846masa) (Onetime donate)
