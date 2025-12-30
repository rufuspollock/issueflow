export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: {
    name: string;
    color: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface IssueDependency {
  issueNumber: number;
  dependsOn: number[];
}

export interface AppState {
  repo: string;
  token: string;
  issues: GitHubIssue[];
  dependencies: IssueDependency[];
  loading: boolean;
  error: string | null;
}
