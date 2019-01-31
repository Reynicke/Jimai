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


function mapJiraToKimai(issues) {
  Object.keys(issues).forEach((id) => {
    const issue = issues[id];
    let mapKey = 'default';
    if (issue.key in config.mapping) {
      mapKey = issue.key;
    }
    Object.assign(issue, config.mapping[mapKey]);

    issue.comment = createComment(issue);
  });
}

function createComment(issue) {
  let comment = issue.textPattern;
  Object.keys(issue).forEach((key) => {
    comment = comment.replace(`[${key}]`, issue[key]);
  });
  return comment;
}

function preview(issues) {
  let totalTime = 0;
  Object.keys(issues).forEach((id) => {
    const issue = issues[id];
    const from = `${issue.key} ${issue.summary}`;
    const to = `${issue.label}`;
    const durationSum = issue.worklogs.reduce((a, b) => a + b, 0);
    const duration = `${durationSum}h (${issue.worklogs.join(', ')})`;
    const comment = issue.comment;
    totalTime += durationSum;

    console.log('[\n Time:\t', duration, '\n Jira:\t', from, '\n Kimai:\t', to, '\n Comm.:\t', comment, '\n]');
  });
  console.log(' Total Time:', totalTime + 'h');
}
