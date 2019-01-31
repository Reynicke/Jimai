const unirest = require('unirest');

let cfg;
let apiKey = null;

setConfig = (c) => {
  cfg = c;
};


async function authenticate() {
  return new Promise((resolve) => {
    post('authenticate', cfg.auth)
        .then((data) => {
          apiKey = data[0].apiKey;
          resolve();
        }, () => {
          console.error('Kimai auth error');
          process.exit(1);
        });
  })
}

async function writeWorklogs(worklogs, dateStr) {
  if (!apiKey) {
    await authenticate();
  }

  let counter = 0;
  let timeMarker = 8;
  return new Promise((resolve) => {
    Object.keys(worklogs).forEach((key) => {
      const worklog = worklogs[key];
      const wlTime = worklog.worklogs.reduce((a, b) => a + b, 0);
      const date = formatDate(dateStr);
      const from = date + ' ' + formatTime(timeMarker);
      const to = date + ' ' + formatTime(timeMarker += wlTime);
      const description = worklog.comment;

      counter++;
      addWorklog(worklog, from, to, description)
          .then(() => {
            counter--;
            if (counter === 0) {
              resolve();
            }
          })
          .catch(() => {
            console.error('Kimai error');
            process.exit(1);
          });
    });
  })
}

function addWorklog(worklog, from, to, description = '') {
  const postData = {
    "apiKey": apiKey,
    "record": {
      "projectId": worklog.projectId,
      "taskId": worklog.taskId,
      "start": from,
      "end": to,
      "description": description,
      "commentType": 0,
      "statusId": 1,
    },
    "doUpdate": false
  };

  return post('setTimesheetRecord', postData);
}

function post(method, data) {
  return new Promise((resolve, reject) => {
    unirest.post(cfg.api)
        .type('json')
        .send({
          "jsonrpc": "2.0",
          "method": method,
          "params": data,
          "id": 1
        })
        .end(function (response) {
          if (response.body && response.body.result && response.body.result.success) {
            resolve(response.body.result.items);
          } else {
            reject(response.body.error)
          }
        })
  });
}

/**
 * in: 8.5
 * out: '8:30'
 * @param {number} hours
 * @returns {string}
 */
function formatTime(hours) {
  const parts = hours.toString().split('.');
  const h = parts[0];
  let m = '00';

  if (parts.length > 1) {
    m = Math.round((hours % 1) * 60);
  }

  return `${h}:${m}`;
}

/**
 * in: 2019-01-02
 * out: 2.1.2019
 * @param {string} date
 * @returns {string}
 */
function formatDate(date) {

  const dateObj = new Date(date);
  return `${dateObj.getDate()}.${dateObj.getMonth() + 1}.${dateObj.getFullYear()}`;
}

module.exports = {
  writeWorklogs,
  setConfig
};
