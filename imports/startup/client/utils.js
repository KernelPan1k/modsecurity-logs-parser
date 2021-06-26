import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

/**
 * This collection exists only in the browser cache of the client and let to show notifications
 * @type {Meteor.Collection|Mongo.Collection}
 */
export const Flash = new Mongo.Collection(null);

/**
 * Display flash message notification
 * @param {String} data
 * @param {string} f
 * @return {any}
 */
export const flashMessage = (data, f = 'success') => {
  let message = '';
  let flag = f;

  if (data instanceof Error) {
    message = data.reason || data.message || data.toString();
  } else if (_.isString(data)) {
    message = data;
  } else {
    message = 'Unexpected';
    flag = 'warning';
  }

  if (_.isString(message)
        && _.contains(
          ['success', 'danger', 'info', 'warning', 'error'], flag,
        )
  ) {
    flag = 'error' === flag ? 'danger' : flag;

    return Flash.insert({ message, type: flag });
  }

  return Flash.insert({ message: 'Unexpected', type: 'danger' });
};
