import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Audit } from '../../../lib/api/audit/audit';
import './home.html';

const randHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const makeSeverityChart = () => {
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
  const otherColors = _.map(otherLabel, () => randHexColor());
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
      responsive: true,
      legend: { display: false },
      title: {
        display: true,
        text: 'Severity',
      },
    },
  };

  new Chart(document.querySelector('#chartSeverity'), config);
};

const makeTopAttacksChart = () => {
  const attacks = [];

  _.each(Audit.find({}).fetch(), (a) => {
    _.each(a.messages || [], (m) => {
      const msg = m.msg || null;
      if (msg && -1 === msg.indexOf('Anomaly Score Exceeded')) {
        attacks.push(msg);
      }
    });
  });

  const countAttacks = _.countBy(attacks);
  const pairs = _.pairs(countAttacks);
  const top10 = _.first(_.sortBy(pairs, (z) => z[1]).reverse(), 10);
  const labels = _.map(top10, (z) => z[0]);
  const data = _.map(top10, (z) => z[1]);
  const backgroundColor = _.map(data, () => randHexColor());

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
      responsive: true,
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 10 Attacks',
      },
    },
  };

  new Chart(document.querySelector('#chartTopAttacks'), config);
};

const makeHostsChart = () => {
  const hosts = [];

  _.each(Audit.find({}).fetch(), (a) => {
    if (/^[.-_a-zA-Z]+$/.test(a.host) && !/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(a.host)) {
      hosts.push(a.host);
    }
  });

  const countAttacks = _.countBy(hosts);
  const pairs = _.pairs(countAttacks);
  const top10 = _.first(_.sortBy(pairs, (z) => z[1]).reverse(), 10);
  const labels = _.map(top10, (z) => z[0]);
  const data = _.map(top10, (z) => z[1]);
  const backgroundColor = _.map(data, () => randHexColor());

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
      responsive: true,
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 10 Hosts Attacks',
      },
    },
  };

  new Chart(document.querySelector('#chartTopHost'), config);
};

const makeChart = () => {
  makeSeverityChart();
  makeTopAttacksChart();
  makeHostsChart();
};

Template.home.onCreated(function ConfigOnCreated() {
  this.autorun(() => {
    this.subscribe('home.publish', () => {
      makeChart();
    });
  });
});
