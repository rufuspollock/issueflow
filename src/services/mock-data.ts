import type { GitHubIssue } from '../types';
import mockIssues from '../fixtures/issues.json';

export async function fetchMockIssues(): Promise<GitHubIssue[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockIssues as GitHubIssue[];
}
