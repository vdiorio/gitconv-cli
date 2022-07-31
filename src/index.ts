#!/usr/bin/env node

import inquirer, { Answers } from "inquirer";
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { searchType } from "./helpers";

inquirer.registerPrompt('autocomplete', inquirerPrompt );
inquirer.prompt([
  {
    type: 'autocomplete',
    name: 'type',
    message: `Choose a commit ${'type'.yellow.bold}:`,
    source: searchType,
  },
]).then((answers: Answers) => {
    console.log(answers);
  })