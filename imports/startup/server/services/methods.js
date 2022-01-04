import fs from 'fs';
import path from 'path';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { Config } from '../../../lib/api/config/config';
import { Rules } from '../../../lib/api/rules/rules';
import { extractLogs, extractRules } from './parser';
import { Audit } from '../../../lib/api/audit/audit';

Meteor.methods({
  cleanUpRules() {
    return Rules.remove({});
  },
  cleanUpAudit() {
    return Audit.remove({});
  },
  removeAuditSelected(requestIds) {
    check(requestIds, Array);
    return Audit.remove({ id: { $in: requestIds } });
  },
  cleanUpByRules(rules) {
    check(rules, String);
    const rulesArray = rules.split('\n');
    _.each(rulesArray, (z) => {
      const line = (z || '').trim();
      if ('' === line) {
        return;
      }
      const split = line.split('$$$$');
      const key = split[0];
      const payload = split[1];

      if (-1 !== [
        'id',
        'requestDate',
        'uri',
        'ua',
        'host',
        'sectionA',
        'sectionB',
        'sectionC',
        'sectionE',
        'sectionF',
        'sectionH'].indexOf(key)) {
        const obj = {};
        obj[key] = { $regex: payload };
        Audit.remove(obj);
      }
    });
  },
  parseRules(r) {
    check(r, String);
    const bound = Meteor.bindEnvironment((callback) => {
      callback();
    });
    const rulesPath = Config.findOne().rulesPath || r;

    if (!rulesPath || !_.isDir(rulesPath)) {
      throw new Meteor.Error('not_found', 'Invalid path');
    }

    fs.readdir(rulesPath, (err, files) => {
      bound(() => {
        if (err) {
          throw err;
        }

        files.forEach((file) => {
          if (/.+\.conf$/.test(file)) {
            const rules = extractRules(path.join(rulesPath, file));
            _.each(rules, (r) => {
              if (r.id && r.plain) {
                // eslint-disable-next-line no-param-reassign
                r.related = _.uniq(r.related);
                // eslint-disable-next-line no-param-reassign
                r.tags = _.uniq(r.tags);
                try {
                  const docId = Rules.findOne({ id: r.id });
                  if (_.isId(docId)) {
                    Rules.update({ _id: docId }, r);
                  } else {
                    Rules.insert(r);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            });
          }
        });
      });
    });

    return true;
  },
  parseAuditLogs() {
    const bound = Meteor.bindEnvironment((callback) => {
      callback();
    });
    const auditPath = Config.findOne().auditPath;

    if (!auditPath || !_.isDir(auditPath)) {
      throw new Meteor.Error('not_found', 'Invalid path');
    }

    fs.readdir(auditPath, (err, files) => {
      bound(() => {
        if (err) {
          throw err;
        }

        files.forEach((file) => {
          if (/.+\.log$/.test(file)) {
            const logs = extractLogs(path.join(auditPath, file));
            _.each(logs, (r) => {
              if (r.id && r.plain) {
                // eslint-disable-next-line no-param-reassign
                r.related = _.uniq(r.related);
                // eslint-disable-next-line no-param-reassign
                r.tags = _.uniq(r.tags);
                try {
                  const docId = Rules.findOne({ id: r.id });
                  if (!_.isId(docId)) {
                    Rules.insert(r);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            });
          }
        });
      });
    });

    return true;
  },
});
