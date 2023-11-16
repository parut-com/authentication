const parutUrl = 'https://api.parut.com';
const authManUrl = 'https://authman.parut.com';

const initialConfig = {
  usersMapping: {
    tableName: 'users',
    usernameProperty: 'email'
  },
  loginTitle: 'Example Login Title'
};

function generateConfigSchema ({ config }) {
  return [
    {
      title: 'Settings',
      description: 'Custom settings for the extension',
      type: 'object',
      properties: {
        loginTitle: {
          title: 'Login Page Title',
          type: 'string'
        },
        usersMapping: {
          title: 'Users Data Mapping',
          type: 'object',
          properties: {
            tableName: {
              title: 'Users Table',
              type: 'string'
            },
            usernameProperty: {
              title: 'Username Property',
              type: 'string'
            }
          }
        },
        domain: {
          title: 'Domain',
          type: 'string',
          readOnly: true
        },
        oidcConfigUrl: {
          title: 'OpenID Connect Configuration',
          type: 'string',
          readOnly: true
        }
      }
    },
    {
      title: 'Clients',
      description: 'Manage your external OIDC Clients',
      type: 'object',
      properties: {
        clients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                title: 'Client ID',
                type: 'string'
              },
              redirectUris: {
                title: 'Allowed Redirect Urls',
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            },
            required: ['id', 'redirectUris']
          }
        }
      }
    }
  ];
}

function generateSessionTable () {
  return {
    name: 'sessions',
    type: 'table',
    title: 'Sessions',
    icon: 'person',
    schema: {
      title: 'Sessions',
      icon: 'person',
      properties: {
        name: {
          title: 'Name',
          type: 'string'
        }
      },
      required: [
        'name'
      ]
    }
  };
}

function generateUserTable () {
  return {
    name: 'users',
    type: 'table',
    title: 'Users',
    icon: 'person',
    schema: {
      title: 'Users',
      icon: 'person',
      properties: {
        email: {
          title: 'Email Address',
          type: 'string'
        },
        name: {
          title: 'Name',
          type: 'string'
        },
        password: {
          title: 'Password',
          type: 'string',
          minLength: 6
        },
        loginEnabled: {
          title: 'Login Enabled',
          type: 'boolean'
        }
      },
      required: [
        'name'
      ]
    }
  };
}

function generateListPage () {
  return {
    type: 'page',
    name: 'users',
    slug: 'users',
    title: 'List users',
    content: () => [
      ['Heading', {
        icon: 'person',
        title: 'Users'
      },
      [
        ['Link', { url: 'users/create' }, 'Add User']
      ]
      ],
      ['Table', {
        tableName: 'users',
        defaultFields: [
          'name',
          'email',
          'dateCreated'
        ]
      }]
    ]
  };
}

function generateCreatePage () {
  return {
    type: 'page',
    name: 'usersCreate',
    slug: 'users/create',
    title: 'Create user',
    content: () => {
      const schema = [
        {
          title: 'Create User',
          type: 'object',
          properties: {
            name: {
              title: 'Full Name',
              type: 'string'
            },
            email: {
              title: 'Email Address',
              type: 'string'
            },
            password: {
              title: 'Password',
              type: 'string',
              format: 'password'
            },
            loginEnabled: {
              title: 'Login Enabled',
              type: 'boolean'
            }
          },
          required: [
            'enabled'
          ]
        }
      ];

      return [
        ['Heading', {
          icon: 'person',
          title: 'Create User'
        }],
        ['Form', {
          tableName: 'users',
          getRedirectionUrl: () => '/users',
          schema,
          defaultFields: [
            'name',
            'email',
            'dateCreated'
          ]
        }]
      ];
    }
  };
}

function generateMenu () {
  return {
    type: 'menu',
    name: 'users',
    parent: null,
    title: 'Users',
    icon: 'file',
    slug: 'users'
  };
}

function generateToken () {
  return {
    type: 'accessToken',
    name: 'general',
    title: 'Full access',
    icon: 'file',
    permissions: {
      'registry.tables.sessions': ['get', 'post', 'put', 'delete']
    }
  };
}

async function onChange ({ account, extension, config, tokens }) {
  config = config || initialConfig;

  const response = await fetch(`${authManUrl}/v1/accounts/${account.id}/extensions/${extension.id}`, {
    method: 'put',
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer ' + tokens.general
    },
    body: JSON.stringify({
      accountId: account.id,
      token: tokens.general,
      title: config.loginTitle,
      clients: config.clients,
      usersUrl: `${parutUrl}/v1/accounts/${account.id}/users`,
      properties: {
        username: 'email',
        password: 'password',
        enabled: 'loginEnabled'
      }
    })
  });

  if (!response.ok) {
    const result = await response.text().catch(() => 'no response text');
    throw new Error('could not sync with oidc server: ' + result);
  }

  const result = await response.json();

  return {
    ...initialConfig,
    ...config,
    domain: result.domain,
    oidcConfigUrl: result.domain + '/.well-known/openid-configuration'
  };
}

function generateSchemas () {
  return [
    generateSessionTable(),
    generateUserTable(),
    generateListPage(),
    generateCreatePage(),
    generateMenu(),
    generateToken()
  ].flat();
}

module.exports = {
  generateConfigSchema,
  generateSchemas,
  onChange
};
