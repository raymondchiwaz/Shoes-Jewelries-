const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy lockfile if present and choose installer
const pnpmLock = path.join(process.cwd(), 'pnpm-lock.yaml')
const npmLock = path.join(process.cwd(), 'package-lock.json')
const yarnLock = path.join(process.cwd(), 'yarn.lock')

let installer = null
let installerCwd = MEDUSA_SERVER_PATH

if (fs.existsSync(pnpmLock)) {
  fs.copyFileSync(pnpmLock, path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml'))
  installer = { cmd: 'pnpm i --prod --frozen-lockfile', name: 'pnpm' }
} else if (fs.existsSync(npmLock)) {
  fs.copyFileSync(npmLock, path.join(MEDUSA_SERVER_PATH, 'package-lock.json'))
  installer = { cmd: 'npm ci --only=production', name: 'npm' }
} else if (fs.existsSync(yarnLock)) {
  fs.copyFileSync(yarnLock, path.join(MEDUSA_SERVER_PATH, 'yarn.lock'))
  installer = { cmd: 'yarn install --production', name: 'yarn' }
}

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Install dependencies using detected package manager
if (installer) {
  console.log(`Installing dependencies in .medusa/server using ${installer.name}...`)
  execSync(installer.cmd, {
    cwd: installerCwd,
    stdio: 'inherit'
  })
} else {
  console.warn('No lockfile found; skipping dependency install in .medusa/server.')
}
