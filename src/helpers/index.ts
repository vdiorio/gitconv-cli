import {CommitInfo, ConventionalCommitTypes} from '../interfaces';
import types from '../data/types.json';
import execa from 'execa';
import Fuse from 'fuse.js';

export function setDescriptionIndent(string: string) {
  const DEFAULT_LENGTH = 6;
  let spaceDescription = string;
  while (spaceDescription.length < DEFAULT_LENGTH) {
    spaceDescription += ' ';
  }
  return spaceDescription;
}

export function searchType(_answers: CommitInfo, input = '') {
  const typesChoices: ConventionalCommitTypes[] = [...types, ...types.map((t: ConventionalCommitTypes) => ({
    type: `${t.type}!`, description: `${t.description} ${'("BREAKING CHANGE")'.dim}`,
  }))];

  return new Promise((resolve) => {
    resolve(filterCommitTypes(typesChoices, input).map(({type, description}) => ({
      name: `${setDescriptionIndent(type).yellow.bold} - ${description}`,
      value: type,
    })));
  });
}

export async function commit(commitInfo: CommitInfo) {
  const {type, title, scope, body, footers} = commitInfo;
  const hasScope = scope !== '';
  const hasFooters = footers.length !== 0;
  try {
    await execa(
        'git',
        [
          'commit',
          '-m', `${type.trim()}${hasScope ? `(${scope})` : ''}: ${title}`,
          '-m', `${body.trim()}`,
          '-m', `${hasFooters ? `${footers.join('\n')}` : ''}`,
        ],
        {
          buffer: false,
          stdio: 'inherit',
        },
    );
  } catch (e) {
    const error = e as { escapedCommand: string };
    console.error(
        '\n',
        'Oops! An error ocurred. There is likely additional logging output above.\n'.red,
        'You can run the same commit with this command:\n'.red,
        error.escapedCommand.blue,
    );
  }
}

export function filterCommitTypes(
    commitTypes: Array<ConventionalCommitTypes>,
    input: string,
): ConventionalCommitTypes[] {
  const options = {
    threshold: 0.5,
    keys: [
      {
        name: 'type',
        weight: 0.33,
      },
      {
        name: 'description',
        weight: 0.67,
      },
    ],
  };
  const fuse = new Fuse(commitTypes, options);

  return input ? fuse.search(input).map((type) => type.item) : commitTypes;
};
