import process from 'node:process';
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': 'PivotIQCatalogVerifier/1.0 (+https://pivotiq.app)',
        accept: 'text/html,application/xhtml+xml',
      },
    });

    const ok = response.status >= 200 && response.status < 400;

    return {
      ok,
      status: response.status,
      finalUrl: response.url || url,
      error: ok ? null : `Unexpected status ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      finalUrl: null,
      error: String(error),
    };
  }
}

function classifyVerification(url, result) {
  let hostname = '';
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {}

  if (result.ok) {
    return {
      verificationStatus: 'verified',
      status: 'active',
    };
  }

  const isRestrictedProvider =
    hostname.includes('udemy.com') ||
    hostname.includes('datacamp.com');

  if (isRestrictedProvider && result.status === 403) {
    return {
      verificationStatus: 'restricted',
      status: 'active',
    };
  }

  return {
    verificationStatus: 'failed',
    status: 'review',
  };
}

try {
  await client.connect();
  const { rows } = await client.query(`
    select id, slug, title, url
    from public.course_catalog
    order by provider, title
  `);

  let verifiedCount = 0;
  let failedCount = 0;

  for (const row of rows) {
    const result = await verifyUrl(row.url);
    const { verificationStatus, status } = classifyVerification(row.url, result);

    await client.query(
      `
        update public.course_catalog
        set
          verification_status = $2,
          verification_http_status = $3,
          final_url = $4,
          verification_error = $5,
          last_checked_at = now(),
          verified_at = case when $2 = 'verified' then now() else verified_at end,
          status = $6,
          updated_at = now()
        where id = $1
      `,
      [
        row.id,
        verificationStatus,
        result.status,
        result.finalUrl,
        result.error,
        status,
      ]
    );

    if (verificationStatus === 'verified') {
      verifiedCount += 1;
      console.log(`VERIFIED ${row.slug} -> ${result.finalUrl || row.url} (${result.status})`);
    } else if (verificationStatus === 'restricted') {
      console.log(`RESTRICT ${row.slug} -> ${row.url} (${result.status})`);
    } else {
      failedCount += 1;
      console.log(`FAILED   ${row.slug} -> ${row.url} (${result.error || 'unknown error'})`);
    }

    await sleep(250);
  }

  console.log(`Verification complete. Verified: ${verifiedCount}. Failed: ${failedCount}.`);
} finally {
  await client.end();
}
