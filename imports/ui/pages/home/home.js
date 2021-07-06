import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Audit } from '../../../lib/api/audit/audit';
import './home.html';

const makeSeverity = () => {
  const severities = [];

  _.each(Audit.find({}).fetch(), (a) => {
    _.each(a.messages || [], (m) => {
      const s = m.severity || null;
      if (s) {
        severities.push(s);
      }
    });
  });

  const definedLabel = ['CRITICAL', 'WARNING', 'NOTICE'];
  const definedColors = ['red', 'orange', 'blue'];

  const otherLabel = _.difference(definedLabel, _.uniq(severities));
  const labels = _.flatten([definedLabel, otherLabel]);
  const otherColors = _.map(otherLabel, () => `#${Math.floor(Math.random() * 16777215).toString(16)}`);
  const backgroundColor = _.flatten([definedColors, otherColors]);
  const countSeverity = _.countBy(severities);
  const data = _.map(labels, (l) => countSeverity[l]);

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          backgroundColor,
          data,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Severity',
      },
    },
  };

  new Chart(document.querySelector('#chartSeverity'), config);
};

const makeChart = () => {
  makeSeverity();
};

Template.home.onCreated(function ConfigOnCreated() {
  this.autorun(() => {
    this.subscribe('home.publish', () => {
      makeChart();
    });
  });
});
