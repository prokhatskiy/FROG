// @ flow

export const Meteor = {
  error: (message, key) => {
    throw {
      type: 'fakeMeteor.error',
      message,
      key
    };
  },
  methods: () => undefined,
  isServer: true
};

export const Mongo = {
  Collection: () => undefined
};

export const withTracker = () => () => undefined;
