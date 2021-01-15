import * as process from 'process'
import * as childProcess from 'child_process'
import {promisify} from 'util'
import {join} from 'path'

const execFile = promisify(childProcess.execFile)
const action = join(__dirname, '..', 'lib', 'main.js')
const execActionWith = (fixtureDir: string) => {
  const fixturePath = join(__dirname, 'fixtures', fixtureDir)

  return execFile(process.execPath, [action], {
    env: {
      ...process.env,
      INPUT_DIR: fixturePath,
      PATH: `${fixturePath}:${process.env.PATH}`
    }
  })
}

test('no package json', async () => {
  await expect(execActionWith('no-package-json')).rejects.toMatchObject({
    stdout: expect.stringContaining('ENOENT'),
    code: 1
  })
})

test('no name', async () => {
  await expect(execActionWith('no-name')).rejects.toMatchObject({
    stdout: expect.stringContaining('File is not a valid package.json'),
    code: 1
  })
})

test('no version', async () => {
  await expect(execActionWith('no-version')).rejects.toMatchObject({
    stdout: expect.stringContaining('File is not a valid package.json'),
    code: 1
  })
})

test('not-published-before', async () => {
  const {stdout} = await execActionWith('not-published-before')

  expect(stdout).toEqual(
    expect.stringContaining('::set-output name=published::false')
  )

  expect(stdout).toEqual(
    expect.stringContaining('::set-output name=version::1.0.0')
  )
})

test('not-published-version', async () => {
  const {stdout} = await execActionWith('not-published-version')

  expect(stdout).toEqual(
    expect.stringContaining('::set-output name=published::false')
  )

  expect(stdout).toEqual(
    expect.stringContaining('::set-output name=version::16.6.4')
  )
})

test('published-version', async () => {
  const {stdout} = await execActionWith('published-version')

  expect(stdout).toEqual(
    expect.stringContaining('::set-output name=published::true')
  )

  expect(stdout).toEqual(
    expect.stringContaining('::set-output name=version::16.6.3')
  )
})
