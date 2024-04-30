export type Task = {
  name: string,
  id: string, 
  parents: string[],
  children: string[],
  inputFiles?: string[],
  outputFiles?: string[]
}

export type File = {
  id: string,
  sizeInBytes: number
}

export type WfInstance = {
  id?: string
  name: string,
  description?: string,
  createdAt?: string,
  schemaVersion: string,
  runtimeSystem?: {
    name: string,
    version: string,
    url?: string
  },
  author?: {
    name: string,
    email: string,
    institution?: string,
    country?: string
  }
  workflow: {
    specification: {
      tasks: Task[],
      files?: File[]
    },
    execution: {
      makespanInSeconds: number,
      executedAt: string,
      tasks: {
        id: string, 
        runtimeInSeconds: number,
        command?: {
          program?: string,
          arguments?: string[]
        },
        coreCount?: number,
        avgCpu?: number,
        readBytes?: number,
        writtenBytes?: number, 
        memoryInBytes?: number,
        energyInKWh?: number,
        avgPowerInW?: number,
        priority?: number,
        machines?: string[]
      }[],
      machines?: {
        system?: 'linux' | 'macos' | 'windows',
        architecture?: string,
        nodeName: string, 
        release?: string, 
        memoryInBytes?: number,
        cpu?: {
          coreCount?: number,
          speedInMHz?: number,
          vendor?: string
        }
      }[]
    }
  }
}
