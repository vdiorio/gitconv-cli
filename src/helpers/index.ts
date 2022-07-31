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
