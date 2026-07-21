import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { execSync } from 'child_process';

const COLLECTIONS = [
  'users',
  'coupons',
  'bookings',
  'partners',
  'blocked_dates',
  'availability',
  'gallery',
  'settings',
  'leads',
  'expense_categories',
  'global_expenses',
  'other_incomes',
  'logs',
  'reviews',
  'credit_notes',
  'blogs',
  'notifications'
];

async function runBackup() {
  console.log('=== Starting Complete Web-SDK Backup Process ===');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const dbBackupDir = path.join(backupDir, `db_${timestamp}`);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.mkdirSync(dbBackupDir, { recursive: true });

  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  console.log(`Initialized Web SDK. Connected to database ID: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);

  const exportedStats: { [key: string]: number } = {};

  for (const colName of COLLECTIONS) {
    try {
      console.log(`Fetching collection: "${colName}"...`);
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      const docsData: any[] = [];
      
      snapshot.forEach(doc => {
        docsData.push({
          _id: doc.id,
          ...doc.data()
        });
      });

      const colBackupFile = path.join(dbBackupDir, `${colName}.json`);
      fs.writeFileSync(colBackupFile, JSON.stringify(docsData, null, 2), 'utf8');
      exportedStats[colName] = docsData.length;
      console.log(`  Saved ${docsData.length} documents from "${colName}"`);
    } catch (err: any) {
      console.error(`  Failed to fetch "${colName}":`, err.message);
      exportedStats[colName] = -1;
    }
  }

  // Save metadata
  const metaData = {
    timestamp,
    projectId: firebaseConfig.projectId,
    collectionsBackedUp: COLLECTIONS,
    stats: exportedStats
  };
  fs.writeFileSync(
    path.join(dbBackupDir, 'metadata.json'),
    JSON.stringify(metaData, null, 2),
    'utf8'
  );

  console.log('\n--- Codebase Archiving ---');
  const tarName = `backup_${timestamp}.tar.gz`;
  const tarPath = path.join(backupDir, tarName);

  try {
    const excludeFlags = [
      '--exclude=node_modules',
      '--exclude=dist',
      '--exclude=.git',
      '--exclude=backups/backup_*.tar.gz'
    ].join(' ');

    const cmd = `tar ${excludeFlags} -czf "${tarPath}" -C "${process.cwd()}" .`;
    execSync(cmd, { stdio: 'inherit' });
    
    const stats = fs.statSync(tarPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\nBackup archive created successfully: ${tarName} (${sizeInMB} MB)`);
  } catch (err: any) {
    console.error('Error creating tarball:', err.message);
  }
}

runBackup().catch(err => {
  console.error('Backup Process Failed:', err);
  process.exit(1);
});
