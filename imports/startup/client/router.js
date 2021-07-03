import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {
  name: 'home',
  action() {
    BlazeLayout.render('publicLayout', { main: 'home' });
  },
});

FlowRouter.route('/import', {
  name: 'import',
  action() {
    BlazeLayout.render('publicLayout', { main: 'import' });
  },
});

FlowRouter.route('/rules', {
  name: 'rules',
  action() {
    BlazeLayout.render('publicLayout', { main: 'rules' });
  },
});

FlowRouter.route('/audit', {
  name: 'audit',
  action() {
    BlazeLayout.render('publicLayout', { main: 'audit' });
  },
});

FlowRouter.route('/audit/:id', {
  name: 'audit-display',
  action() {
    BlazeLayout.render('publicLayout', { main: 'auditDisplay' });
  },
});
