export interface CommitInfo {
  type: string,
  scope: string,
  title: string,
  body: string,
  footers: string[],
}

export interface ConventionalCommitTypes {
  type: string,
  description: string,
}
