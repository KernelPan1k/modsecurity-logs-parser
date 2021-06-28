/* eslint-disable consistent-return */
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

class ConfigCollection extends Mongo.Collection {
  insert(doc) {
    return super.insert(doc, {
      trimStrings: true,
      removeEmptyStrings: false,
    });
  }

  update(selector, modifier, cb = {}) {
    const callback = cb || {};
    _.extend(callback, {
      trimStrings: true,
      removeEmptyStrings: false,
    });

    return super.update(selector, modifier, callback);
  }
}

export const Config = new ConfigCollection('config');

Config.deny({
  update: () => true,
  insert: () => true,
  remove: () => true,
});

const Schemas = {};

Schemas.Config = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  rulesPath: {
    type: String,
    optional: true,
    label: 'Rules path',
  },
  auditPath: {
    type: String,
    optional: true,
    label: 'Audit Logs path',
  },
  submitted: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      }
    },
  },
}, {
  clean: {
    removeEmptyStrings: false,
    trimStrings: true,
  },
});

Config.attachSchema(Schemas.Config);
