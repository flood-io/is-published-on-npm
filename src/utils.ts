import {readFile} from 'fs'
import {promisify} from 'util'
import * as exec from '@actions/exec'

export async function readPackageJson(
  filePath: string
): Promise<Record<string, unknown>> {
  const content = await promisify(readFile)(filePath)
  return JSON.parse(content.toString())
}

export async function getPackageVersions(
  packageName: string
): Promise<string[]> {
  let stdout = ''
  let stderr = ''
  const options = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString()
      },
      stderr: (data: Buffer) => {
        stderr += data.toString()
      }
    }
  }

  try {
    await exec.exec(`npm info ${packageName} versions --json`, [], options)
  } catch (execError) {
    try {
      const errorJson = JSON.parse(stdout)
      if (errorJson.error.code === 'E404') {
        // package doesn't exist yet, therefor no versions
        return []
      } else {
        // something else went wrong with npm
        throw new Error(stderr)
      }
    } catch (maybeParseError) {
      if (maybeParseError instanceof SyntaxError) {
        // swallow JSON parse error and fall through to execError
      } else {
        // catch and throw what went wrong with npm
        throw maybeParseError
      }
    }

    throw execError
  }

  const versions = JSON.parse(stdout)
  return versions
}
