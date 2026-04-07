import process from 'node:process';
import { auditJobOpeningsQuality } from '../lib/job-openings-quality.js';

const limit = Math.min(Math.max(Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 300), 50), 1000);

try {
  const audit = await auditJobOpeningsQuality({ limit });
  console.log(JSON.stringify(audit, null, 2));
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
