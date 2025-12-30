import { describe, it, expect } from 'vitest';
import { parseDependencies } from './processing';
import type { GitHubIssue } from '../types';

describe('parseDependencies', () => {
    it('should parse "depends on #XX" correctly', () => {
        const issues: Partial<GitHubIssue>[] = [
            { number: 1, body: 'Base issue' },
            { number: 2, body: 'Depends on #1' },
            { number: 3, body: 'Blocked by #2 and depends on #1' }
        ];

        const deps = parseDependencies(issues as GitHubIssue[]);

        expect(deps).toHaveLength(2);
        expect(deps.find(d => d.issueNumber === 2)?.dependsOn).toEqual([1]);
        expect(deps.find(d => d.issueNumber === 3)?.dependsOn).toEqual([2, 1]);
    });

    it('should handle case insensitivity', () => {
        const issues: Partial<GitHubIssue>[] = [
            { number: 1, body: 'Base' },
            { number: 2, body: 'DEPENDS ON #1' },
            { number: 3, body: 'blocked by #1' }
        ];

        const deps = parseDependencies(issues as GitHubIssue[]);

        expect(deps).toHaveLength(2);
        expect(deps.map(d => d.dependsOn[0])).toEqual([1, 1]);
    });

    it('should deduplicate dependencies in the same body', () => {
        const issues: Partial<GitHubIssue>[] = [
            { number: 2, body: 'Depends on #1 and also depends on #1' }
        ];

        const deps = parseDependencies(issues as GitHubIssue[]);
        expect(deps[0].dependsOn).toEqual([1]);
    });

    it('should return empty list when no dependencies found', () => {
        const issues: Partial<GitHubIssue>[] = [
            { number: 1, body: 'No deps here' }
        ];

        const deps = parseDependencies(issues as GitHubIssue[]);
        expect(deps).toHaveLength(0);
    });

    it('should handle null or empty body', () => {
        const issues: Partial<GitHubIssue>[] = [
            { number: 1, body: null },
            { number: 2, body: '' }
        ];

        const deps = parseDependencies(issues as GitHubIssue[]);
        expect(deps).toHaveLength(0);
    });
});
