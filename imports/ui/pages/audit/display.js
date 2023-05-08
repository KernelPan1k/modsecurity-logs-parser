import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Audit } from '../../../lib/api/audit/audit';
import { Rules } from '../../../lib/api/rules/rules';
import './display.html';
import { flashMessage } from '../../../startup/client/utils';

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

Template.auditDisplay.events({
  'click #remove': (event) => {
    event.preventDefault();
    const element = event.currentTarget;
    const id = element.getAttribute('data-id');
    Meteor.call('removeAuditSelected', [id], (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('audit entry removed', 'success');
    });
  },
});
