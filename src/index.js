const argv = require('yargs').argv;
const config = require('./config.js');
const jira = require('./jira.js');
const kimai = require('./kimai.js');

const writeParam = argv.write;
const dateParam = argv.date || new Date();
const date = new Date(dateParam).toISOString().split('T')[0];


console.log(`Date: ${date}`);

jira.setConfig(config.jira);
jira.getWorklogs(date).then((worklogs) => {
  mapJiraToKimai(worklogs);
  preview(worklogs);

  if (writeParam) {
    kimai.setConfig(config.kimai);
    kimai.writeWorklogs(worklogs, date)
        .then(() => {
          console.log('Done!');
        })
  } else {
    console.log('\n');
    console.log('Nothing happened yet! If you would like to write this data to kimai, add the write parameter: --write');
    console.log('\n');
  }
});


function mapJiraToKimai(worklogs) {
  Object.keys(worklogs).forEach((id) => {
    const worklog = worklogs[id];
    let mapKey = 'default';
    if (worklog.key in config.mapping) {
      mapKey = worklog.key;
    }
    Object.assign(worklog, config.mapping[mapKey]);
  });
}

function preview(worklogs) {
  let totalTime = 0;
  Object.keys(worklogs).forEach((id) => {
    const worklog = worklogs[id];
    const from = `${worklog.key} ${worklog.summary}`;
    const to = `${worklog.label}`;
    const durationSum = worklog.worklogs.reduce((a, b) => a + b, 0);
    const duration = `${durationSum}h (${worklog.worklogs.join(', ')})`;
    totalTime += durationSum;

    console.log('[\n Time:\t', duration, '\n Jira:\t', from, '\n Kimai:\t', to, '\n]');
  });
  console.log(' Total Time:', totalTime + 'h');
}
