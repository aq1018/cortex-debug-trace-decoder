export interface DecoderConfig<CONFIG> {
  type: string
  ports: number[]
  decoder: string
  config: CONFIG
}

export type DecoderOutputDataFn = (output: string) => void

export type DecoderGraphDataFn = (data: number | bigint, id: string) => void

export interface Decoder<CONFIG> {
  init: (
    config: DecoderConfig<CONFIG>,
    outputData: DecoderOutputDataFn,
    graphData: DecoderGraphDataFn,
  ) => void

  typeName: () => string

  outputLabel: () => string

  softwareEvent: (port: number, data: Buffer) => void

  synchronized: () => void

  lostSynchronization: () => void
}
