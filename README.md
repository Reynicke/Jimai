# Jimai

## Introduction
Jimai is a node based CLI tool to transfer worklogs of a single day from Jira to Kimai. 

Attention: It connects to Kimai 1 (current version ist 2.x, see https://www.kimai.org/documentation/versions.html)!

## Setup
1. Get clone or download this repo
2. Run `npm install` or `yarn` to install dependencies
3. Create a config file

## Config
To create a `config.js` file you should use `config.example.js` as template.
##### Jira
    jiraUserName: Your Jira user name to identify your own worklogs
    project: Used as filter to find your worklogs
    pass: Jira token for API access
##### Kimai
    api: Url to JSON api
    auth: User name and password 
##### mapping
Used to identify which Jira worklogs should go to which Kimai tasks.
Add entries for specific Jira issues. All other worklogs will be mapped
to the default entry.  


## How to use
Run Jimai to see all worklogs you added to Jira for today.
This is a dry run.

    $ ./jimai.sh

To use data from another day, use the `--date` argument:
       
    $ ./jimai.sh --date 2019-01-24
    
Jimai prints all found worklogs so you can check if everything is fine.
If you finally want to send data to Kimai use the `--write` argument.

    $ ./jimai.sh --write
    $ ./jimai.sh --date 2019-01-24 --write
