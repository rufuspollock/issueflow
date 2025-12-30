import type { GitHubIssue, IssueDependency } from '../types';

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

export function parseDependencies(issues: GitHubIssue[]): IssueDependency[] {
    const deps: IssueDependency[] = [];

    issues.forEach((issue) => {
        const body = issue.body || '';
        const dependsOn: number[] = [];

        // Simple regex to match "depends on #123" or "blocked by #123"
        const regex = /(?:depends on|blocked by)\s+#(\d+)/gi;
        let match;
        while ((match = regex.exec(body)) !== null) {
            dependsOn.push(parseInt(match[1], 10));
        }

        if (dependsOn.length > 0) {
            deps.push({
                issueNumber: issue.number,
                dependsOn: Array.from(new Set(dependsOn)), // Deduplicate
            });
        }
    });

    return deps;
}
