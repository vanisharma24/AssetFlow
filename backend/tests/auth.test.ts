import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/utils/auth'

test('hashes and verifies passwords', async () => {
  const password = 'StrongPassword123!'
  const hashed = await hashPassword(password)

  assert.notEqual(hashed, password)
  assert.equal(await comparePassword(password, hashed), true)
  assert.equal(await comparePassword('wrong-password', hashed), false)
})

test('signs and verifies JWTs', () => {
  const token = signToken({ sub: 'user-1', email: 'user@example.com', role: 'Employee' })
  const payload = verifyToken(token)

  assert.equal(payload.sub, 'user-1')
  assert.equal(payload.email, 'user@example.com')
  assert.equal(payload.role, 'Employee')
})
