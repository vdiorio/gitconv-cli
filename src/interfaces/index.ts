export interface CommitInfo {
  type: string,
  scope: string,
  title: string,
  body: string,
  footer: string,
}

export interface ConventionalCommitTypes {
  type: string,
  description: string,
}
