import { Octokit } from '@octokit/rest';

export default class ReposCrud {
  constructor(settings) {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      log: {
        debug: console.log,
        info: console.log,
        warn: console.warn,
        error: console.error,
      },
    });
  }
  
  get(condition) {
    throw Error('Not implemented');
  }

  async read(condition) {
    const { status, data: pagedRepos } = await this.octokit.rest.repos.listForOrg({
      org: 'Adalab',
      sort: 'updatedAt',
      direction: 'asc',
      per_page: 20,
      page: 1,
    });

    if (status !== 200) {
      console.error(`GitHub status error ${status}`);
      throw new Error("Error Git: ");
    }

    return pagedRepos;
  }
  
  create(item) {
    throw Error('Not implemented');
  }

  update(condition, item) {
    throw Error('Not implemented');
  }

  del(condition) {
    throw Error('Not implemented');
  }
}

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
}
