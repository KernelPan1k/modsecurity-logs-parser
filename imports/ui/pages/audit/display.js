import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Audit } from '../../../lib/api/audit/audit';
import { ReactiveVar } from 'meteor/reactive-var';
import { Rules } from '../../../lib/api/rules/rules';
import './display.html';

Template.auditDisplay.onCreated(function auditDisplayOnCreated() {
  const id = FlowRouter.getParam('id');
  this.audit = new ReactiveVar(null);

  this.autorun(() => {
    this.subscribe('audit_display.publish', id);
    this.audit.set(Audit.findOne({ _id: id }));
  });
});

Template.auditDisplay.helpers({
  getAudit() {
    return Template.instance().audit.get() || null;
  },
  getRules() {
    const audit = Template.instance().audit.get() || null;

    if (!audit) {
      return null;
    }

    const rulesIds = [];

    _.each(audit.messages || [], (z) => {
      if (z.id) {
        rulesIds.push(z.id);
      }
    });

    return Rules.find({ id: { $in: rulesIds } });
  },
});
