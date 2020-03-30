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

    if (config.mapping['keys'] && issue.key in config.mapping['keys']) {
      Object.assign(issue, config.mapping['keys'][issue.key]);
    }
    else if (config.mapping['customFields'] && matchCustomField(issue)) {
      const configEntry = matchCustomField(issue);
      Object.assign(issue, config.mapping['customFields'][configEntry.key]);
    }
    else if (config.mapping['default']) {
      Object.assign(issue, config.mapping['default']);
    }
    else {
      console.log('\n');
      console.log('Jira issue could not be mapped to Kimai!');
      console.log(issue);
      console.log('\n');
      return;
    }

    issue.comment = createComment(issue);
  });
}

function matchCustomField(issue) {
  const configEntries = Object.keys(config.mapping['customFields']).map(key => {
    const parts = key.split('=');
    return { key: key, field: parts[0], value: parts[1] };
  });

  let ndx = configEntries.length;
  while (ndx--) {
    const entry = configEntries[ndx];
    if (issue.customFields[entry.field]) {
      if (Array.isArray(issue.customFields[entry.field]) && issue.customFields[entry.field].includes(entry.value)) {
        return entry;
      }
    }
  }

  return null;
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
