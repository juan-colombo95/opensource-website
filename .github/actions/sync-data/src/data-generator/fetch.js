// const github = require("@actions/github")
const core = require('@actions/core');

const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');
const parseLinkHeader = require('parse-link-header');

const queries = require('./utils/queries');
const { prettyPrintJson, prettyPrint } = require('./utils/helpers');
// const prettyPrintJson = json => console.log(JSON.stringify(json, null, 2))
// const prettyPrint = message => console.log(message)

const DEFAULT_ORG = 'newrelic';
const GH_TOKEN = core.getInput('github-token') || process.env.GH_TOKEN;
console.log(`github-token: ${GH_TOKEN}`);
const REPOS_PER_PAGE = 100;

const octokit = new Octokit({
  auth: GH_TOKEN,
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
});
// const octokit = new github.GitHub(GH_TOKEN, {
//   log: {
//     debug: () => {},
//     info: () => {},
//     warn: console.warn,
//     error: console.error,
//   },
// })

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GH_TOKEN}`,
  },
});

/*

{
  "id": 70148,
  "node_id": "MDEwOlJlcG9zaXRvcnk3MDE0OA==",
  "name": "rpm",
  "full_name": "newrelic/rpm",
  "private": false,
  "owner": {
    "login": "newrelic",
    "id": 31739,
    "node_id": "MDEyOk9yZ2FuaXphdGlvbjMxNzM5",
    "avatar_url": "https://avatars0.githubusercontent.com/u/31739?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/newrelic",
    "html_url": "https://github.com/newrelic",
    "followers_url": "https://api.github.com/users/newrelic/followers",
    "following_url": "https://api.github.com/users/newrelic/following{/other_user}",
    "gists_url": "https://api.github.com/users/newrelic/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/newrelic/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/newrelic/subscriptions",
    "organizations_url": "https://api.github.com/users/newrelic/orgs",
    "repos_url": "https://api.github.com/users/newrelic/repos",
    "events_url": "https://api.github.com/users/newrelic/events{/privacy}",
    "received_events_url": "https://api.github.com/users/newrelic/received_events",
    "type": "Organization",
    "site_admin": false
  },
  "html_url": "https://github.com/newrelic/rpm",
  "description": "New Relic RPM Ruby Agent",
  "fork": false,
  "url": "https://api.github.com/repos/newrelic/rpm",
  "forks_url": "https://api.github.com/repos/newrelic/rpm/forks",
  "keys_url": "https://api.github.com/repos/newrelic/rpm/keys{/key_id}",
  "collaborators_url": "https://api.github.com/repos/newrelic/rpm/collaborators{/collaborator}",
  "teams_url": "https://api.github.com/repos/newrelic/rpm/teams",
  "hooks_url": "https://api.github.com/repos/newrelic/rpm/hooks",
  "issue_events_url": "https://api.github.com/repos/newrelic/rpm/issues/events{/number}",
  "events_url": "https://api.github.com/repos/newrelic/rpm/events",
  "assignees_url": "https://api.github.com/repos/newrelic/rpm/assignees{/user}",
  "branches_url": "https://api.github.com/repos/newrelic/rpm/branches{/branch}",
  "tags_url": "https://api.github.com/repos/newrelic/rpm/tags",
  "blobs_url": "https://api.github.com/repos/newrelic/rpm/git/blobs{/sha}",
  "git_tags_url": "https://api.github.com/repos/newrelic/rpm/git/tags{/sha}",
  "git_refs_url": "https://api.github.com/repos/newrelic/rpm/git/refs{/sha}",
  "trees_url": "https://api.github.com/repos/newrelic/rpm/git/trees{/sha}",
  "statuses_url": "https://api.github.com/repos/newrelic/rpm/statuses/{sha}",
  "languages_url": "https://api.github.com/repos/newrelic/rpm/languages",
  "stargazers_url": "https://api.github.com/repos/newrelic/rpm/stargazers",
  "contributors_url": "https://api.github.com/repos/newrelic/rpm/contributors",
  "subscribers_url": "https://api.github.com/repos/newrelic/rpm/subscribers",
  "subscription_url": "https://api.github.com/repos/newrelic/rpm/subscription",
  "commits_url": "https://api.github.com/repos/newrelic/rpm/commits{/sha}",
  "git_commits_url": "https://api.github.com/repos/newrelic/rpm/git/commits{/sha}",
  "comments_url": "https://api.github.com/repos/newrelic/rpm/comments{/number}",
  "issue_comment_url": "https://api.github.com/repos/newrelic/rpm/issues/comments{/number}",
  "contents_url": "https://api.github.com/repos/newrelic/rpm/contents/{+path}",
  "compare_url": "https://api.github.com/repos/newrelic/rpm/compare/{base}...{head}",
  "merges_url": "https://api.github.com/repos/newrelic/rpm/merges",
  "archive_url": "https://api.github.com/repos/newrelic/rpm/{archive_format}{/ref}",
  "downloads_url": "https://api.github.com/repos/newrelic/rpm/downloads",
  "issues_url": "https://api.github.com/repos/newrelic/rpm/issues{/number}",
  "pulls_url": "https://api.github.com/repos/newrelic/rpm/pulls{/number}",
  "milestones_url": "https://api.github.com/repos/newrelic/rpm/milestones{/number}",
  "notifications_url": "https://api.github.com/repos/newrelic/rpm/notifications{?since,all,participating}",
  "labels_url": "https://api.github.com/repos/newrelic/rpm/labels{/name}",
  "releases_url": "https://api.github.com/repos/newrelic/rpm/releases{/id}",
  "deployments_url": "https://api.github.com/repos/newrelic/rpm/deployments",
  "created_at": "2008-10-31T16:13:01Z",
  "updated_at": "2020-04-13T15:49:55Z",
  "pushed_at": "2020-04-07T20:43:47Z",
  "git_url": "git://github.com/newrelic/rpm.git",
  "ssh_url": "git@github.com:newrelic/rpm.git",
  "clone_url": "https://github.com/newrelic/rpm.git",
  "svn_url": "https://github.com/newrelic/rpm",
  "homepage": "http://www.newrelic.com",
  "size": 22426,
  "stargazers_count": 1055,
  "watchers_count": 1055,
  "language": "Ruby",
  "has_issues": true,
  "has_projects": true,
  "has_downloads": true,
  "has_wiki": true,
  "has_pages": true,
  "forks_count": 507,
  "mirror_url": null,
  "archived": false,
  "disabled": false,
  "open_issues_count": 4,
  "license": {
    "key": "other",
    "name": "Other",
    "spdx_id": "NOASSERTION",
    "url": null,
    "node_id": "MDc6TGljZW5zZTA="
  },
  "forks": 507,
  "open_issues": 4,
  "watchers": 1055,
  "default_branch": "master",
  "permissions": {
    "admin": true,
    "push": true,
    "pull": true
  }
}
*/
/*
 * pages - number of pages to loop through
 * org - Github 'login', either a user or an organization
 * type - Repository type
 * per_page - Repositories to ask for
 * start_page - Beginning page
 * exclude_archived - Whether or not to filter out archived repositories (repos.listForOrg does not offer a way to exclude these from the response)
 */
const organizationRepositoryIterator = function ({
  pages = 1,
  org = DEFAULT_ORG,
  type = 'public',
  per_page = REPOS_PER_PAGE,
  start_page = 1,
  excludeArchived = true,
}) {
  return function () {
    const MAX_PAGES_ALLOWED = 100;

    let isFirstPage = true;
    const startPage = start_page;
    let currentPage = startPage;
    let pagesNeeded;
    let pagesAvailable;

    // How best do we initialize this for the first page?
    let pagesToGet = pages === 0 ? MAX_PAGES_ALLOWED : pages;

    const hasMore = function () {
      return pagesToGet > 0;
    };

    const getCurrentPage = function () {
      return currentPage;
    };

    const firstPage = async function () {
      const firstPage = await fetchOrganizationRepositoryPage({
        org,
        type,
        per_page,
        page: startPage,
      });
      // prettyPrintJson(Object.keys(firstPage.data));

      if (firstPage instanceof Error) {
        prettyPrint('Error: organizationRepositoryIterator#firstPage');
        prettyPrintJson(firstPage);
      }

      // const { status, url, headers, data } = firstPage;
      const linkHeaders = parseLinkHeader(firstPage.headers.link);
      const lastPage = !linkHeaders ? startPage : linkHeaders.last.page;

      pagesNeeded = pages === 0 ? lastPage : pages; // 0 === all pages available
      pagesAvailable = lastPage - start_page;
      pagesToGet = pagesAvailable <= pagesNeeded ? pagesAvailable : pagesNeeded;

      return firstPage;
    };

    const next = function () {
      let nextPage = false;

      if (hasMore()) {
        if (isFirstPage) {
          nextPage = firstPage();
        }

        if (!isFirstPage) {
          nextPage = fetchOrganizationRepositoryPage({
            org,
            type,
            per_page,
            page: currentPage,
          });
        }

        isFirstPage = false;
        pagesToGet = pagesToGet - 1;
        currentPage = currentPage + 1;
      }

      // prettyPrintJson({ value: nextPage, done: !hasMore() });
      return { value: nextPage, done: !hasMore() };
    };

    return {
      hasMore,
      next,
      getCurrentPage,
    };
  };
};

const fetchOrganizationRepositoryPage = async function ({
  org,
  type,
  per_page,
  page,
}) {
  try {
    const response = await octokit.repos.listForOrg({
      org,
      type,
      per_page,
      page,
    });

    const { status, url, headers, data } = response;
    console.log(`\nPage: ${page} found ${data.length} total results`);

    // prettyPrintJson(response.data.length);
    // prettyPrintJson(response.status);
    return response;
  } catch (e) {
    console.error(e);
    return e;
  }
};

const fetchRepositoryStats = async function (owner, repo) {
  return graphqlWithAuth(queries.repositoryStats(owner, repo));
};

const fetchContributorStats = async function (owner, repo) {
  try {
    const contributorStats = await octokit.repos.getContributorsStats({
      owner,
      repo,
    });
    return contributorStats;
  } catch (e) {
    prettyPrint(e);
  }
};

const getRepoStatsByContributor = async function (owner, repo) {
  const response = await fetchContributorStats(owner, repo);
  const { status, url, headers, data } = response;

  // newrelic/newrelic_plugins_puppet
  // newrelic/newrelic-monolog-logenricher-php
  if (Array.isArray(data)) {
    const formattedContributorStats = data.map(({ total, author }) => ({
      total: total,
      author: author,
    }));

    // prettyPrint(formattedContributorStats);
    return formattedContributorStats;
  }

  prettyPrint(
    `Warning, no repoStatsByContributor found for Owner: ${owner} Repo: ${repo}`
  );
  prettyPrint('Instead found: ');
  prettyPrintJson(data);

  return {};
};

const fetchStats = async function (owner, repo) {
  // 1. Graphql, includes releases.totalCount, issues.totalCount, forks.totalCount, pullRequests.totalCount
  const repoStats = await fetchRepositoryStats(owner, repo);
  // prettyPrint(Object.keys(repoStats.repository));
  /*
   [
    'id',               'collaborators',
    'releases',         'issues',
    'forks',            'pullRequests',
    'pushedAt',         'milestones',
    'mentionableUsers', 'languages',
    'labels',           'isFork',
    'deployments',      'commitComments'
  ]*/

  // 2a. Individual Contributor stats
  const contributorStats = await getRepoStatsByContributor(owner, repo); // strips out the 'weeks' object

  // prettyPrint(contributorStats);

  // TO DO - Find a better way than listing all contributors
  // 2b. Number of contributors by way of listing all contributors
  // const contributors = await octokit.repos.listContributors({
  //   owner,
  //   repo
  // });
  // prettyPrint(Object.keys(contributors));
  // const contributorCount = contributors.data || 0;

  return { repoStats: repoStats.repository, contributorStats };
};

const fetchRepo = async function ({ options }) {
  const { org: owner, repo } = options;

  return octokit.repos.get({
    owner,
    repo,
  });
};

module.exports = {
  organizationRepositoryIterator,
  fetchRepositoryStats,
  fetchContributorStats,
  getRepoStatsByContributor,
  fetchStats,
  fetchRepo,
};