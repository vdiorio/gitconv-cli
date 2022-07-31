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
]).then((answers: Answers) => {
    console.log(answers);
  })