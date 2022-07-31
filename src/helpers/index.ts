import fuzzy from 'fuzzy';
import {CommitInfo, ConventionalCommitTypes} from '../interfaces';
import types from '../data/types.json';
import execa from 'execa';

export function setDescriptionIndent(string: string) {
  const DEFAULT_LENGTH = 6;
  let spaceDescription = string;
  while (spaceDescription.length < DEFAULT_LENGTH) {
    spaceDescription += ' ';
  }
  return spaceDescription;
}

export function searchType(_answers: CommitInfo, input = '') {
  return new Promise((resolve) => {
    const choices = types.map(({type, description}: ConventionalCommitTypes) => ({
      name: `${setDescriptionIndent(type).yellow.bold} - ${description}`,
      value: type,
    }));

    setTimeout(() => {
      resolve(fuzzy.filter(input, choices.map(({name}: { name: string }) => name))
          .map((el: { original: string }) => choices.find((c: { name: string }) => c.name === el.original)));
    }, Math.random() * 470 + 30);
  });
}
