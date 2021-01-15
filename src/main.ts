import * as core from '@actions/core'
import {join} from 'path'
import {readPackageJson, getPackageVersions} from './utils'

async function run(): Promise<void> {
  try {
    const dir = core.getInput('dir')
    const packagePath = join(dir, 'package.json')
    const {version, name} = await readPackageJson(packagePath)

    if (typeof version !== 'string' || typeof name !== 'string') {
      throw new Error(`File is not a valid package.json: ${packagePath}`)
    }

    const versions = await getPackageVersions(name)
    core.setOutput('published', versions.includes(version))
    core.setOutput('version', version)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
