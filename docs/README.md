### 📦 Install Dependencies

Navigate to the `docs` folder and install the required packages:

```bash
cd docs
yarn install
```

---

### 🚀 Run Locally

To start the development server:

```bash
cd docs
yarn dev
```

---

### 🐛 Debugging OpenSSL Errors

If you encounter the following error:

```bash
opensslErrorStack: [
  'error:03000086:digital envelope routines::initialization error',
  'error:0308010C:digital envelope routines::unsupported'
],
library: 'digital envelope routines',
reason: 'unsupported',
code: 'ERR_OSSL_EVP_UNSUPPORTED'
```

You can resolve it by setting the following environment variable:

```bash
# On Linux/macOS
export NODE_OPTIONS=--openssl-legacy-provider

# On Windows (CMD)
set NODE_OPTIONS=--openssl-legacy-provider
```

---

### 📝 Add a New Page

1. Create a new Markdown file in the `documentation/` folder.

2. Register the page in the children array in the sidebar by editing `.vuepress/config.js`:

```js
sidebar: {
  '/documentation/': [
    {
      title: 'Documentation',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        '',
        'run-setup',
        'configuration',
        'website',
        'plots',
        'example',
      ]
    }
  ],
}
```

3. Commit and push your changes — you're done! 🎉