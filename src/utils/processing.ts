import type { GitHubIssue, IssueDependency } from '../types';

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
