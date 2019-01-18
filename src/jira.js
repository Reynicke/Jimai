const unirest = require('unirest');
let config;

setConfig = (c) => {
  config = c;
};

function getWorklogs(date) {
  return new Promise((resolve) => {
    const jql = `project = ${config.project} AND worklogAuthor = ${config.jiraUserName} AND worklogDate = ${date}`;
    unirest.get('https://winedock.atlassian.net/rest/api/latest/search')
        .auth(config.jiraAuth)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .query({ "jql": jql })
        .end(async function (response) {
          if ('errorMessages' in response.body) {
            console.error(response.body.errorMessages);
            process.exit(1);
          }

          const issues = getIssueList(response.body);
          console.log(`${Object.keys(issues).length} issue(s) found`);
          const result = await findWorklogsFromIssues(issues, date);
          resolve(result);
        });
  })
}

function getIssueList(data) {
  const issues = {};
  for (let i = 0; i < data.issues.length; i++) {
    issues['id_' + data.issues[i].id] = {
      key: data.issues[i].key,
      summary: data.issues[i].fields.summary,
      url: data.issues[i].self,
    };
  }
  return issues;
}

function findWorklogsFromIssues(issues, date) {
  return new Promise((resolve) => {
    let counter = 0;
    const ids = Object.keys(issues);
    ids.forEach((id) => {
      const issue = issues[id];
      unirest.get(issue.url)
          .auth(config.jiraAuth)
          .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
          .end(function (response) {
            const allWorklogs = response.body.fields.worklog.worklogs;
            const ownersWorklogs = allWorklogs.filter((log) =>
                log.author.key === config.jiraUserName && log.created.indexOf(date) === 0
            );
            issue.worklogs = ownersWorklogs.map((log) => log.timeSpentSeconds / 3600);
            if (!issue.worklogs.length) {
              delete issues[id];
            }
            counter++;
            if (counter === ids.length) {
              resolve(issues);
            }
          });
    })
  });
}

module.exports = {
  getWorklogs,
  setConfig
};
