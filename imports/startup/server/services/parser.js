import { _ } from 'meteor/underscore';
import fs from 'fs';

class AuditLog {
  constructor(logId, a, b, e, f, h, z) {
    this.logId = logId;
    this.a = a;
    this.b = b;
    this.e = e;
    this.f = f;
    this.h = h;
    this.z = z;
  }

  parseA() {
    const a = this.a || '';
    const regEx = '/^\[([0-9]{2}/[a-zA-Z]+/[0-9]{4}(:[0-9]{2}){3}) +[0-9]+\]/';
    if (regEx.test(a)) {
      const arr = a.match(regEx);
      this.requestDate = new Date(arr[0]);
    }
  }
}

/**
 * @param file
 * @returns {*[]}
 */
export const extractRules = (file) => {
  const rules = [];
  try {
    const data = fs.readFileSync(file, 'UTF-8');
    const lines = data.split(/\r?\n/);
    let rule = {
      id: '',
      phase: null,
      tags: [],
      related: [],
      plain: '',
    };

    let record = false;

    lines.forEach((line) => {
      if (/^#/.test(line)) {
        return false;
      }

      if (_.isEmpty(line)) {
        if (!_.isEmpty(rule.plain)) {
          rules.push(rule);
          rule = {
            id: '',
            tags: [],
            related: [],
            plain: '',
          };
        }
        record = false;
        return false;
      }

      if (/^SecRule (.+)/.test(line)) {
        if (!_.isEmpty(rule.plain)) {
          rules.push(rule);
          rule = {
            id: '',
            tags: [],
            related: [],
            plain: '',
          };
        }
        record = true;
      }

      if (record) {
        rule.plain += line;

        if (/id:([0-9]+),/.test(line)) {
          const arr = line.match(/id:([0-9]+)/);
          rule.id = parseInt(arr[1], 10);
        }
        if (/phase:([1-5]),/g.test(line)) {
          const arr = line.match(/phase:([1-5]),/);
          rule.phase = parseInt(arr[1], 10);
        }
        if (/tag:'([-_ a-zA-Z0-9]+)',/g.test(line)) {
          const arr = line.match(/tag:'([-_ a-zA-Z0-9]+)',/);
          rule.tags.push(arr[1]);
        }
        if (/ctl:rule([a-zA-Z]+)Id=([0-9]+)/g.test(line)) {
          const arr = line.match(/ctl:rule([a-zA-Z]+)Id=([0-9]+)/);
          rule.related.push(parseInt(arr[2], 10));
        }
      }

      return true;
    });
  } catch (err) {
    console.error(err);
  }

  return rules;
};
