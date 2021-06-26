/* eslint-disable consistent-return */
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

import { CustomRegex } from '../../utils';

class RulesCollection extends Mongo.Collection {
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

export const Rules = new RulesCollection('rules');

Rules.deny({
  update: () => true,
  insert: () => true,
  remove: () => true,
});

const Schemas = {};

Schemas.Rules = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  id: {
    type: Number,
    label: 'CSR ID',
  },
  phase: {
    type: Number,
    label: 'phase',
  },
  related: {
    type: Array,
    autoValue() {
      if (this.isInsert && !this.value) {
        return [];
      }
    },
  },
  'related.$': {
    type: Number,
  },
  tags: {
    type: Array,
    autoValue() {
      if (this.isInsert && !this.value) {
        return [];
      }
    },
  },
  'tags.$': {
    type: String,
    regEx: CustomRegex.tag,
  },
  plain: {
    type: String,
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

Rules.attachSchema(Schemas.Rules);
