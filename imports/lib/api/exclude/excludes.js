/* eslint-disable consistent-return */
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

class ExcludeCollection extends Mongo.Collection {
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

export const Exclude = new ExcludeCollection('exclude');

Exclude.deny({
  update: () => true,
  insert: () => true,
  remove: () => true,
});

const Schemas = {};

Schemas.Exclude = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  excludeRules: {
    type: String,
    optional: true,
    label: 'Exclude list',
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

Exclude.attachSchema(Schemas.Exclude);
