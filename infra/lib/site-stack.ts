import { fileURLToPath } from 'node:url';
import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';

/** Settings for {@link SiteStack}. Values that identify the account come from `infra/.env`. */
export interface SiteStackProps extends StackProps {
  /** Apex domain; `www.` redirects to it. */
  readonly domainName: string;
  /** ID of the existing Route 53 public hosted zone for `domainName`. */
  readonly hostedZoneId: string;
  /** `owner/repo` allowed to deploy. */
  readonly githubRepo: string;
  /** Only workflows running on this branch can assume the deploy role. */
  readonly deployBranch: string;
  readonly budgetEmail: string;
  readonly monthlyBudgetUsd: number;
}

/**
 * Hosts the static Astro build: private S3 bucket behind CloudFront, DNS in the
 * existing hosted zone, and a GitHub Actions deploy role that needs no stored keys.
 */
export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const { domainName } = props;
    const wwwDomainName = `www.${domainName}`;

    // Imported, not created: this stack never owns or deletes the zone.
    const zone = route53.PublicHostedZone.fromPublicHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: domainName,
    });

    // The wildcard covers www now and demo subdomains later.
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // Everything in it is rebuilt by CI, but keep it if the stack is ever deleted.
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const viewerRequest = new cloudfront.Function(this, 'ViewerRequestFunction', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromFile({
        filePath: fileURLToPath(new URL('./viewer-request.js', import.meta.url)),
      }),
      comment: 'www redirect, directory index and trailing-slash rewrite',
    });

    // Without s3:ListBucket, S3 answers 403 for missing keys, so treat 403 as 404 too.
    const notFound: cloudfront.ErrorResponse[] = [403, 404].map((httpStatus) => ({
      httpStatus,
      responseHttpStatus: 404,
      responsePagePath: '/404.html',
      ttl: Duration.minutes(5),
    }));

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [domainName, wwwDomainName],
      certificate,
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      errorResponses: notFound,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        functionAssociations: [
          { function: viewerRequest, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
    });

    const aliasTarget = route53.RecordTarget.fromAlias(
      new targets.CloudFrontTarget(distribution),
    );
    for (const [id, recordName] of [
      ['Apex', domainName],
      ['Www', wwwDomainName],
    ]) {
      new route53.ARecord(this, `${id}A`, { zone, recordName, target: aliasTarget });
      new route53.AaaaRecord(this, `${id}Aaaa`, { zone, recordName, target: aliasTarget });
    }

    // GitHub Actions signs in with short-lived OIDC tokens; no AWS keys are stored in GitHub.
    const githubOidc = new iam.OidcProviderNative(this, 'GitHubOidcProvider', {
      url: `https://${GITHUB_OIDC_HOST}`,
      clientIds: ['sts.amazonaws.com'],
    });

    const deployRole = new iam.Role(this, 'GitHubDeployRole', {
      description: `Deploys ${props.githubRepo} (${props.deployBranch}) to the site bucket`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(githubOidc.oidcProviderArn, {
        StringEquals: {
          [`${GITHUB_OIDC_HOST}:aud`]: 'sts.amazonaws.com',
          [`${GITHUB_OIDC_HOST}:sub`]: `repo:${props.githubRepo}:ref:refs/heads/${props.deployBranch}`,
        },
      }),
    });
    // Exactly what `aws s3 sync --delete` and one invalidation need, nothing more.
    // sync compares by listing (size, timestamp), so it never reads objects.
    deployRole.addToPolicy(
      new iam.PolicyStatement({ actions: ['s3:ListBucket'], resources: [bucket.bucketArn] }),
    );
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:DeleteObject'],
        resources: [bucket.arnForObjects('*')],
      }),
    );
    distribution.grantCreateInvalidation(deployRole);

    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: props.monthlyBudgetUsd, unit: 'USD' },
      },
      notificationsWithSubscribers: [
        { notificationType: 'ACTUAL', threshold: 80 },
        { notificationType: 'FORECASTED', threshold: 100 },
      ].map((notification) => ({
        notification: { ...notification, comparisonOperator: 'GREATER_THAN' },
        subscribers: [{ subscriptionType: 'EMAIL', address: props.budgetEmail }],
      })),
    });

    // Printed only in your terminal by `cdk deploy`; copy them into GitHub repository secrets.
    new CfnOutput(this, 'SiteBucketName', { value: bucket.bucketName });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn });
  }
}
