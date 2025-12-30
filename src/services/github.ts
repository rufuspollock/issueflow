import type { GitHubIssue } from '../types';

export async function fetchIssues(repo: string, token: string): Promise<GitHubIssue[]> {
    const [owner, name] = repo.split('/');
    if (!owner || !name) throw new Error('Invalid repo format. Use owner/repo');

    const response = await fetch(`https://api.github.com/repos/${owner}/${name}/issues?state=all&per_page=100`, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch issues');
    }

    return response.json();
}
