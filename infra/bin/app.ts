import { App } from 'aws-cdk-lib';
import { SiteStack } from '../lib/site-stack.ts';

/** Returns a required environment variable, failing fast if it's missing. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Copy infra/.env.example to infra/.env and fill it in.`);
  }
  return value;
}

/** Returns a required environment variable as a positive number. */
function requirePositiveNumberEnv(name: string): number {
  const value = Number(requireEnv(name));
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return value;
}

const app = new App();

// No account is set, so the template refers to the account as AWS::AccountId and
// never contains the ID itself. The certificate for CloudFront must be in us-east-1.
new SiteStack(app, 'PortfolioSiteStack', {
  env: { region: 'us-east-1' },
  terminationProtection: true,
  domainName: requireEnv('DOMAIN_NAME'),
  hostedZoneId: requireEnv('HOSTED_ZONE_ID'),
  githubRepo: requireEnv('GITHUB_REPO'),
  deployBranch: requireEnv('GITHUB_REPO_BRANCH'),
  budgetEmail: requireEnv('BUDGET_EMAIL'),
  monthlyBudgetUsd: requirePositiveNumberEnv('BUDGET_USD'),
});
