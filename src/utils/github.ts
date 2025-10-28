import axios from 'axios';
import type { GitHubRepo, GitHubLabel, GitHubIssue } from '../types';

const GITHUB_API = 'https://api.github.com';

export class GitHubAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await axios.get(`${GITHUB_API}/user`, {
        headers: this.headers,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    const response = await axios.get(`${GITHUB_API}/user/repos`, {
      headers: this.headers,
      params: {
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator,organization_member',
      },
    });
    return response.data;
  }

  async getLabels(owner: string, repo: string): Promise<GitHubLabel[]> {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/labels`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createLabel(owner: string, repo: string, label: {
    name: string;
    color: string;
    description?: string;
  }): Promise<GitHubLabel> {
    const response = await axios.post(
      `${GITHUB_API}/repos/${owner}/${repo}/labels`,
      label,
      { headers: this.headers }
    );
    return response.data;
  }

  async createIssue(owner: string, repo: string, issue: GitHubIssue) {
    const response = await axios.post(
      `${GITHUB_API}/repos/${owner}/${repo}/issues`,
      issue,
      { headers: this.headers }
    );
    return response.data;
  }

  async searchIssues(owner: string, repo: string, query: string) {
    const response = await axios.get(`${GITHUB_API}/search/issues`, {
      headers: this.headers,
      params: {
        q: `repo:${owner}/${repo} ${query} is:issue`,
        per_page: 5,
        sort: 'created',
        order: 'desc',
      },
    });
    return response.data.items;
  }

  async getIssue(owner: string, repo: string, issueNumber: number) {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getRepositoryIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/issues`,
      {
        headers: this.headers,
        params: { state, per_page: 100 }
      }
    );
    return response.data;
  }

  async uploadFileToRepository(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ) {
    // Upload file via GitHub API - base64 encoded content
    const response = await axios.put(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      {
        message,
        content: content, // Already base64 encoded
        branch,
      },
      { headers: this.headers }
    );
    return response.data;
  }

  async uploadScreenshots(
    owner: string,
    repo: string,
    screenshots: Array<{ data: string; timestamp?: number }>
  ): Promise<string[]> {
    const uploadedPaths: string[] = [];
    
    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      const timestamp = screenshot.timestamp || Date.now();
      const filename = `screenshot-${timestamp}-${i + 1}.png`;
      const path = `screenshots/${filename}`;
      
      try {
        // Extract base64 data (remove data:image/png;base64, prefix if present)
        const base64Data = screenshot.data.includes(',')
          ? screenshot.data.split(',')[1]
          : screenshot.data;
        
        await this.uploadFileToRepository(
          owner,
          repo,
          path,
          base64Data,
          `Add screenshot ${i + 1} from issue creation - ${new Date().toISOString()}`
        );
        
        uploadedPaths.push(path);
      } catch (err) {
        console.error(`Failed to upload screenshot ${i + 1}:`, err);
        // Continue with next screenshot even if one fails
      }
    }
    
    return uploadedPaths;
  }

  async request(endpoint: string, options: any = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const response = await axios.get(url, {
      headers: { ...this.headers, ...options.headers },
      ...options,
    });
    return response.data;
  }
}

