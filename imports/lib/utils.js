/* eslint-disable max-len */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import path from 'path';
import fs from 'fs';

const sanitizeString = (str) => str.replace(/[^-.'a-zA-Z0-9âêôûÄéÇàèÊùÌÍÎÏÒÓÔÖÙÚÛÜÝáäçëìíîïòóöúü\s]+/g, '');

const sanitizeTitle = (str) => str.replace(/[;^|_"`´~={}\\[\]]+/g, '');

export const CustomRegex = {
  tag: /^[-._ '"a-zA-Z0-9\s+]+$/,
  isoDate: /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
};

const sanitizeRecursive = (d, func) => {
  let data = d;

  if (_.isString(data)) {
    if (_.isUrl(data)) {
      return data;
    }

    return func(data);
  }
  if (_.isArray(data)) {
    data = _.map(data, (z) => sanitizeRecursive(z, func));

    return data;
  }
  if (_.isObject(data) && false === data instanceof Date) {
    return _.mapObject(data, (z) => sanitizeRecursive(z, func));
  }

  return data;
};

/** underscoreJs mixin */
_.mixin({
  isDir(p) {
    try {
      const stat = fs.statSync(p);
      return stat.isDirectory();
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  isAbsolutePath(p) {
    return path.isAbsolute(p);
  },
  isId(id) {
    return SimpleSchema.RegEx.Id.test(id);
  },
  isArrayId(arr) {
    if (!_.isArray(arr) || 0 === arr.length) {
      return false;
    }

    for (let i = 0, l = arr.length; i < l; i++) {
      if (!_.isId(arr[i])) {
        return false;
      }
    }

    return true;
  },
  isTag(tag) {
    return _.isString(tag) && CustomRegex.tag.test(tag) && 30 >= tag.length;
  },
  truncate(str, nbr) {
    if (!str) {
      return '';
    }
    
    if (str.length <= nbr) {
      return str;
    }
    
    return `${str.substring(0, nbr)}...`;
  },
});

/**
 * convert a string to Date object
 * @param {String} str
 * @return {*}
 */
export const stringToDateAsUTC = (str) => {
  try {
    return moment.utc(str, 'DD/MM/YYYY')
      .toDate();
  } catch (e) {
    return null;
  }
};

/**
 * Build a regular expression for the search engine
 * @param w
 * @returns {RegExp}
 */
export const buildRegExp = (w) => {
  const searchText = sanitizeString(_.clean(w));
  const words = searchText.split(/[ ]+/);
  const exps = _.map(words, (word) => `(?=.*${word})`);
  const fullExp = `${exps.join('')}.+`;

  return new RegExp(fullExp, 'i');
};

/**
 * Return a random hexadecimal string
 * @param {Number} l
 */
export const generateHash = (l = 20) => Random.hexString(l);

/** Custom assert functions for meteor/check */
export const assert = {
  title: Match.Where((txt) => {
    check(txt, String);

    return Meteor.settings.public.title_length >= txt.length && CustomRegex.title.test(txt);
  }),
  description: Match.Where((txt) => {
    check(txt, String);

    return '' === txt || Meteor.settings.public.description_length >= txt.length;
  }),
  url: Match.Where((txt) => {
    check(txt, String);

    return _.isUrl(txt);
  }),
  email: Match.Where((txt) => {
    check(txt, String);

    return _.isEmail(txt);
  }),
  id: Match.Where((id) => {
    check(id, String);

    return _.isId(id);
  }),
  arrayId: Match.Where((ids) => {
    check(ids, Array);

    return _.isArrayId(ids);
  }),
  positiveInteger: Match.Where((x) => {
    check(x, Match.Integer);

    return 0 <= x;
  }),
  color: Match.Where((x) => {
    check(x, String);

    return _.isColor(x);
  }),
  isoDate: Match.Where((x) => {
    check(x, String);

    if ('' !== x) {
      return _.isISODate(x);
    }

    return '' === x;
  }),
  tag: Match.Where((x) => {
    check(x, String);

    return _.isTag(x);
  }),
  emptyStringOrUrl: Match.Where((x) => {
    check(x, String);

    return '' === x || _.isUrl(x);
  }),
  emptyStringOrId: Match.Where((x) => {
    check(x, String);

    return '' === x || _.isId(x);
  }),
  emptyArrayOrArrayString: Match.Where((x) => {
    check(x, Array);

    if (_.isEmpty(x)) {
      return true;
    }

    let valid = true;

    for (let i = 0, l = x.length; i < l; i++) {
      if (!_.isString(x[i])) {
        valid = false;
        break;
      }
    }

    return valid;
  }),
  emptyArrayOrArrayId: Match.Where((x) => {
    check(x, Array);

    if (_.isEmpty(x)) {
      return true;
    }

    return _.isArrayId(x);
  }),
  emptyArrayOrArrayTags: Match.Where((x) => {
    check(x, Array);

    if (_.isEmpty(x)) {
      return true;
    }

    let valid = true;

    _.each(x, (t) => {
      if (valid) {
        valid = _.isTag(t);
      }
    });

    return valid;
  }),
};
