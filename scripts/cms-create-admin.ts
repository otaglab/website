// Creates a CMS admin account. Usage: pnpm cms:create-admin <email> "<Full name>"
// Prints a one-time random password: log in and change it right away.
import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const [email, ...nameParts] = process.argv.slice(2)
  if (!email?.includes('@') || !nameParts.length) {
    console.error('Usage: pnpm cms:create-admin <email> "<Full name>"')
    process.exit(1)
  }
  const payload = await getPayload({ config })
  const password = randomBytes(18).toString('base64url')
  await payload.create({ collection: 'users', data: { email, name: nameParts.join(' '), role: 'admin', password }, context: { trustedScript: true } })
  console.log(`Created admin ${email}\nTemporary password: ${password}\nLog in at /admin and change it under Account.`)
  await payload.destroy()
  process.exit(0)
}

await main()
