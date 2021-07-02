import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './display.html';

Template.auditDisplay.onCreated(function auditDisplayOnCreated() {
  const id = FlowRouter.getQueryParam('id');

  this.autorun(() => {
    this.subscribe('audit_display.publish', id);
  });
});
