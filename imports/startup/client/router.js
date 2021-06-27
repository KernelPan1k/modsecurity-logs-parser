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
  name: 'entries',
  action() {
    BlazeLayout.render('publicLayout', { main: 'entries' });
  },
});

FlowRouter.route('/audit-display/:id', {
  name: 'entries-display',
  action() {
    BlazeLayout.render('publicLayout', { main: 'entries_display' });
  },
});
