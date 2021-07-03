import { _ } from 'meteor/underscore';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';

/**
 * Truncate a string if the length of the chain is bigger than the value of the parameter nbr and ends the string with
 * three dot if it was shortened.
 *  @param {String} str the string at truncate
 *  @param {Number} nbr the length of the string at truncate
 *  @return {String}
 */
Template.registerHelper('truncate', (str, nbr = 200) => _.truncate(str, nbr));

/**
 * Truncate a title if the length of the chain is bigger at the value defined in the configuration
 * @param {String} title
 * @return {String}
 */
Template.registerHelper('truncateTitle', (title) => _.clean(_.truncateTitle(title)));

/** Truncate a description if the length of the chain is bigger at the value defined in the configuration
 * @param {String} description
 * @return {String}
 */
Template.registerHelper('truncateDescription', (description) => _.clean(_.truncateDescription(description)));

/**
 * Use a modulo in template. Return a boolean
 * @param {Number} nbr the number for the operation
 * @param {Number} modulo the number for the modulo, 2 by default
 * @return {Boolean}
 */
Template.registerHelper('modulo', (nbr, modulo = 2) => (0 !== nbr && 0 === nbr % modulo));

/** Return true is le last index of the loop */
Template.registerHelper('lastLoop', (list, element) => _.last(list) === element);

/**
 * Transform a array to string
 * @param {Array} arr the array at convert in string
 * @param {String} separator the separator in string
 * @return {String}
 */
Template.registerHelper('arrayToString', (arr) => arr.join(', '));

/**
 * Transform an object date for a more human display, like "1 day ago"
 * @param {Date} date
 * @return {String}
 */
Template.registerHelper('fromNow', (date) => moment(date).fromNow());

Template.registerHelper('formatDateTime', (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'));

/** return true if the values are strictly equal */
Template.registerHelper('isEqual', (val1, val2) => val1 === val2);

/** return true if the values are not equal */
Template.registerHelper('isNotEqual', (val1, val2) => val1 !== val2);

/** Check if is a valid url */
Template.registerHelper('isUrl', (url) => _.isUrl(url));

/** make logical operator in helpers */
Template.registerHelper('condition', (v1, op, v2) => {
  switch (op) {
    case 'and':
      return v1 && v2;
    default:
      return false;
  }
});

/** Check if is a valid url */
Template.registerHelper('displayRules', (r) => {
  const rule = (r || '').split(',\\ ');
  return rule.join(',\\\n ');
});
