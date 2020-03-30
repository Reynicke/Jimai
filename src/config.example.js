
module.exports = {
  jira: {
    userName: 'USER',
    email: 'e@mail.com',
    projects: ['PROJ'],
    jiraAuth: {
      user: 'USER',
      pass: 'TOKEN',
      sendImmediately: true
    }
  },

  kimai: {
    api: 'HTTP://KIMAI/core/json.php',
    auth: ['USER', 'PASSWORD']
  },

  mapping: {
    default: {
      projectId: 1,
      taskId: 1,
      label: 'SOME TEXT',
      textPattern: '[key] [summary]'
    },
    keys: {
      'PROJ-1': {
        projectId: 1,
        taskId: 2,
        label: 'SOME TEXT',
        textPattern: '[key]'
      }
    },
    customFields: {
      'labels=TEST': {
        projectId: 1,
        taskId: 2,
        label: 'SOME TEXT',
        textPattern: 'Has labels: [labels]'
      }
    }
  }
};
