/* eslint-disable consistent-return */
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

class AuditCollection extends Mongo.Collection {
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

export const Audit = new AuditCollection('audit');

Audit.deny({
  update: () => true,
  insert: () => true,
  remove: () => true,
});

const Schemas = {};

Schemas.Audit = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  id: {
    type: String,
    label: 'Audit log request id',
  },
  requestDate: {
    type: Date,
  },
  uri: {
    type: String,
  },
  ua: {
    type: String,
  },
  host: {
    type: String,
  },
  sectionA: {
    type: String,
  },
  sectionB: {
    type: String,
  },
  sectionE: {
    type: String,
  },
  sectionF: {
    type: String,
  },
  sectionH: {
    type: String,
  },
  messages: {
    type: Array,
    autoValue() {
      if (this.isInsert && !this.value) {
        return [];
      }
    },
  },
  'messages.$': {
    type: Object,
  },
  'messages.$.value': {
    type: String,
  },
  'messages.$.data': {
    type: String,
  },
  'messages.$.file': {
    type: String,
  },
  'messages.$.line': {
    type: Number,
  },
  'messages.$.id': {
    type: Number,
  },
  'messages.$.msg': {
    type: String,
  },
  'messages.$.severity': {
    type: String,
  },
  'messages.$.plain': {
    type: String,
  },
  'messages.$.tags': {
    type: Array,
    autoValue() {
      if (this.isInsert && !this.value) {
        return [];
      }
    },
  },
  'messages.$.tags.$': {
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

Audit.attachSchema(Schemas.Audit);
