import { Octokit } from "@octokit/rest";
import type { GitHubIssue } from '../types';

export async function searchIssues(query: string, token: string): Promise<GitHubIssue[]> {
    if (!token) {
        throw new Error("GitHub token is required");
    }

    const octokit = new Octokit({ auth: token });

    try {
        const { data } = await octokit.search.issuesAndPullRequests({
            q: query,
            per_page: 50,
            sort: 'updated',
            order: 'desc'
        });

        // We cast this because Octokit types are very specific and complex, 
        // but the shape matches our interface for the props we care about.
        return data.items as unknown as GitHubIssue[];
    } catch (error: any) {
        console.error("Search failed", error);
        throw new Error(error.message || "Failed to search issues");
    }
}
