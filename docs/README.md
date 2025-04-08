### Install Dependencies
```bash
cd docs
yarn install
```

### Run local
```bash
cd docs
yarn dev
```

### Debug
If you got this error:
```bash
opensslErrorStack: [
    'error:03000086:digital envelope routines::initialization error',
    'error:0308010C:digital envelope routines::unsupported'
],
library: 'digital envelope routines',
reason: 'unsupported',
code: 'ERR_OSSL_EVP_UNSUPPORTED'
```

please run:
```bash
# linux/mac
export NODE_OPTIONS=--openssl-legacy-provider
# windows
set NODE_OPTIONS=--openssl-legacy-provider
```