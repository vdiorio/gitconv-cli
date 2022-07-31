#!/usr/bin/env node
import 'colors';
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
  {
    type: 'input',
    name: 'scope',
    message: `Type in a ${'(scope)'.blue.bold}`,
    transformer(input, { type }) {
      return `${'Preview:'.grey} "${type.yellow}${!input.length ? '' : `(${input})`.blue}${':'.yellow}"`;
    },
    validate(input): boolean | string {
      if (input === '') return true
      return  /^\S+$/.test(input) ? true : 'Scope must not contain spaces';
    }
  },
  {
    type: 'input',
    name: 'title',
    message: `Type in the commit ${'title'.green.bold}`,
    transformer: (input, { type, scope }) => {
      const suffix = `[${input.length}/48] | ${type.yellow}${scope.length ? `(${scope})`.blue : ''}${':'.yellow}`;
      return `${suffix} ${input.green}`;
    },
    validate(input) {
      return input.length > 0 ? true : 'Insert a valid title';
    }
  },
  {
    type: 'input',
    name: 'body',
    message: `Type in the commit ${'body'.cyan} ${'(Optional)'.grey}:`,
    transformer: (input) => `${input.cyan}`,
  },
]).then((answers: Answers) => {
    console.log(answers);
  })