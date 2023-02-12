export function generateSettings ({ config }) {
  return {
    settings: [{
      id: 'enablePasswordLogin',
      title: 'Allow authenticating by password',
      type: 'boolean',
      defaultValue: true
    }]
  };
};

export function generateSchema ({ config }) {
  return {
    entities: {
      client: {
        label: {
          single: 'Session',
          plural: 'Sessions'
        },
        icon: 'person',
        fields: {
          name: {
            label: 'Name',
            type: 'string',
            required: true
          }
        }
      }
    },
    pages: {
      sessions: {
        type: 'full-crud',
        defaultSearchDisplayFields: [
          'name',
          'dateCreated'
        ]
      }
    }
  };
};
