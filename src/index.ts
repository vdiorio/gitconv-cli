#!/usr/bin/env node
import 'colors';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import {commit, searchType} from './helpers';
import {CommitInfo} from './interfaces';

inquirer.registerPrompt('autocomplete', inquirerPrompt);
inquirer.prompt([
  {
    type: 'autocomplete',
    name: 'type',
    message: `Choose a commit ${'type'.yellow.bold}:`,
    source: searchType,
  },
  {
    type: 'input',
    name: 'scope',
    message: `Type in a ${'(scope)'.blue.bold}`,
    transformer(input, {type}) {
      return `${'(Optional)'.grey} "${type.yellow}${!input.length ? '' : `(${input})`.blue}${':'.yellow}"`;
    },
    validate(input): boolean | string {
      if (input === '') return true;
      return /^\S+$/.test(input) ? true : 'Scope must not contain spaces';
    },
  },
  {
    type: 'input',
    name: 'title',
    message: `Type in the commit ${'title'.green.bold}`,
    transformer: (input, {type, scope}) => {
      const suffix = `[${input.length}/48] | ${type.yellow}${scope.length ? `(${scope})`.blue : ''}${':'.yellow}`;
      return `${suffix} ${input.green}`;
    },
    validate(input) {
      return input.length > 0 ? true : 'Insert a valid title';
    },
  },
  {
    type: 'input',
    name: 'body',
    message: `Type in the commit ${'body'.cyan} ${'(Optional)'.grey}:`,
    transformer: (input) => `${input.cyan}`,
  },
]).then(async (answers: CommitInfo) => {
  let loop = true;
  answers.footers = [];
  while (loop) {
    console.log(`${'?'.green} Footers[${answers.footers.length.toString().magenta}] ${'(Optional)'.grey}:`);
    const ans = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'add',
        message: 'Add footer?',
        default: false,
      },
      {
        type: 'input',
        name: 'footer',
        message: `Type in the commit ${'footer'.magenta} ${'(Optional)'.magenta}:`,
        transformer: (input) => `${input.magenta}`,
        when: ({add}) => add,
      },
    ]);
    loop = ans.add;
    if (ans.footer) answers.footers.push(ans.footer);
  }
  commit(answers);
});
