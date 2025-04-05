
module.exports = {
  jira: {
    userName: 'USER',
    email: 'e@mail.com',
    projects: ['PROJ'],
    jiraAuth: {
      user: 'USER',
      pass: 'TOKEN',
      sendImmediately: true
    },
    url: 'https://COMPANY.atlassian.net',
    customFields: []
  },

  kimai: {
    api: 'https://KIMAI/core/json.php',
    auth: ['USER', 'PASSWORD']
  },

  mapping: {
    // Default mapping, if no other match is found.
    // Set projectId and taskId to the id of the project and task in Kimai.
    // label is just for you to identify the match in preview.
    // textPattern defines the Kimai text. Besides literal text, you can use [placeholders] which match Jira fields.
    default: {
      projectId: 1,
      taskId: 1,
      label: 'DEFAULT WORK',
      textPattern: '[key] [summary]'
    },
    // Match by jira issue key
    keys: {
      'PROJ-1': {
        projectId: 1,
        taskId: 2,
        label: 'WORK ON PROJ-1',
        textPattern: 'worked on [key]'
      }
    },
    // Match by jira issue custom field like labels
    customFields: {
      'labels=TEST': {
        projectId: 1,
        taskId: 2,
        label: 'TESTING WORK',
        textPattern: 'Has labels: [labels]'
      }
    }
  }
};
