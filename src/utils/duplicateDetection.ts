import { GitHubAPI } from './github';
import type { DuplicateIssueMatch, GitHubRepo } from '../types';

export class DuplicateDetector {
  private api: GitHubAPI;

  constructor(token: string) {
    this.api = new GitHubAPI(token);
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   * Returns a value between 0 (completely different) and 1 (identical)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (!s1 || !s2) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Extract keywords from text for better matching
   */
  private extractKeywords(text: string): Set<string> {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where',
      'why', 'how'
    ]);

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return new Set(words.filter(word => !stopWords.has(word) && word.length > 3));
  }

  /**
   * Calculate Jaccard similarity for keyword matching
   */
  private calculateKeywordSimilarity(text1: string, text2: string): number {
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);

    if (keywords1.size === 0 || keywords2.size === 0) return 0;

    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);

    return intersection.size / union.size;
  }

  /**
   * Combined similarity score using multiple algorithms
   */
  private calculateCombinedScore(
    title1: string,
    title2: string,
    body1: string,
    body2: string
  ): number {
    const titleSimilarity = this.calculateSimilarity(title1, title2);
    const bodyKeywordSim = this.calculateKeywordSimilarity(body1, body2);
    const bodySimilarity = this.calculateSimilarity(
      body1.substring(0, 200),
      body2.substring(0, 200)
    );

    // Weight: title 50%, body keywords 30%, body text 20%
    return titleSimilarity * 0.5 + bodyKeywordSim * 0.3 + bodySimilarity * 0.2;
  }

  /**
   * Search for duplicate issues in a repository
   */
  async findDuplicates(
    repo: GitHubRepo,
    title: string,
    body: string,
    threshold: number = 0.6
  ): Promise<DuplicateIssueMatch[]> {
    try {
      // Get open issues from repository
      const issues = await this.api.getRepositoryIssues(repo.owner.login, repo.name);

      const matches: DuplicateIssueMatch[] = [];

      for (const issue of issues) {
        const score = this.calculateCombinedScore(title, issue.title, body, issue.body || '');

        if (score >= threshold) {
          matches.push({
            id: issue.number,
            title: issue.title,
            body: issue.body || '',
            similarity: score,
            url: issue.html_url,
            state: issue.state,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
          });
        }
      }

      // Sort by similarity score (highest first)
      return matches.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error finding duplicates:', error);
      throw error;
    }
  }

  /**
   * Check if a specific title is likely a duplicate
   */
  isDuplicateLikely(
    newTitle: string,
    existingTitles: string[],
    threshold: number = 0.7
  ): boolean {
    return existingTitles.some(
      title => this.calculateSimilarity(newTitle, title) >= threshold
    );
  }

  /**
   * Group similar issues together
   */
  groupSimilarIssues(
    issues: Array<{ title: string; body: string; id: number }>,
    threshold: number = 0.65
  ): Array<Array<{ title: string; body: string; id: number }>> {
    const groups: Array<Array<{ title: string; body: string; id: number }>> = [];
    const visited = new Set<number>();

    for (const issue of issues) {
      if (visited.has(issue.id)) continue;

      const group = [issue];
      visited.add(issue.id);

      for (const other of issues) {
        if (visited.has(other.id)) continue;

        const score = this.calculateCombinedScore(
          issue.title,
          other.title,
          issue.body,
          other.body
        );

        if (score >= threshold) {
          group.push(other);
          visited.add(other.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }
}

