import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Flash } from '../../../startup/client/utils';
import './flash.html';

/** Helpers get Flash documents */
Template.flashs.helpers({ flashs: () => Flash.find() });

/** Remove current flash message after specific time */
Template.flash.onRendered(() => {
  const flash = Template.currentData();

  if (flash) {
    Meteor.setTimeout(() => Flash.remove(flash._id), 3000);
  }
});
