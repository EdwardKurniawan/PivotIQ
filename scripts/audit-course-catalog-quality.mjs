import process from 'node:process';
import { auditCourseCatalogQuality } from '../lib/course-catalog-quality.js';

const limit = Math.min(Math.max(Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 500), 50), 2000);

try {
  const audit = await auditCourseCatalogQuality({ limit });
  console.log(JSON.stringify(audit, null, 2));
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
