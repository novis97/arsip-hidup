import { existsSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Pengembangan lokal menyimpan rahasia di root monorepo. Di produksi,
// environment disediakan langsung sehingga berkas ini boleh tidak ada.
const rootEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url))

if (existsSync(rootEnvPath)) {
  process.loadEnvFile(rootEnvPath)
}

await import('../node_modules/next/dist/bin/next')
