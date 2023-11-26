import {
  type Decoder,
  type DecoderConfig,
  type DecoderGraphDataFn,
  type DecoderOutputDataFn
} from './types'

export type UnsignedPrimitive =
  'u8' |
  'u16l' |
  'u32l' |
  'u64l' |
  'u16b' |
  'u32b' |
  'u64b'

export type SignedPrimitive =
  'i8' |
  'i16l' |
  'i32l' |
  'i64l' |
  'i16b' |
  'i32b' |
  'i64b'

export type FloatPrimitive = 'f32l' | 'f64l' | 'f32b' | 'f64b'

export type Primitive = UnsignedPrimitive | SignedPrimitive | FloatPrimitive

export interface TraceConfig {
  primitive: Primitive
  graphId: string
}

export interface PortConfig {
  port: number
  traces: TraceConfig[]
}

export interface TraceDecoderConfig {
  label?: string
  ports: PortConfig[]
}

type TraceMap = Record<number, TraceConfig[]>

type TraceState = Record<number, {
  traceIndex: number
  buffer?: Buffer
}>

export default class TraceDecoder
implements Decoder<TraceDecoderConfig> {
  private type!: string
  private label?: string
  private graphData!: DecoderGraphDataFn
  private traceMap!: TraceMap
  private traceState!: TraceState

  init (
    config: DecoderConfig<TraceDecoderConfig>,
    outputData: DecoderOutputDataFn,
    graphData: DecoderGraphDataFn
  ): void {
    const {
      type,
      config: {
        label,
        ports
      }
    } = config

    this.type = type
    this.label = label
    this.graphData = graphData
    this.traceMap = {}
    this.traceState = {}

    ports.forEach(({ port, traces }) => {
      this.traceMap[port] = traces
      this.traceState[port] = { traceIndex: 0 }
    })
  }

  softwareEvent (port: number, data: Buffer): void {
    const state = this.traceState[port]

    // unknown port, skip
    if (state == null) return

    // if there are remaining data from previous call, we concat them.
    let buffer: Buffer
    if (state.buffer != null) {
      buffer = Buffer.concat([state.buffer, data])
    } else {
      buffer = data
    }

    let offset = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const traces = this.traceMap[port]

      // get current trace config
      const { primitive, graphId } = traces[state.traceIndex]

      // not enough bytes in buffer...
      if (!canRead(buffer, primitive, offset)) break

      // read data based on trace primitive
      const [data, bytesRead] = read(buffer, primitive, offset)

      // send data for graphing based on the trace graphId
      this.graphData(data, graphId)

      // prepare to read next data point.
      offset += bytesRead

      // move on to the next trace.
      state.traceIndex++
      // wrap around to the first trace if we are at the last one.
      if (state.traceIndex === traces.length) state.traceIndex = 0
    }

    // update state buffer accordingly
    if (Buffer.byteLength(buffer) > offset) {
      // we have some bytes remaining, save it for the next call
      state.buffer = buffer.subarray(offset)
    } else {
      // used up all bytes, clear state buffer.
      state.buffer = undefined
    }
  }

  typeName (): string {
    return this.type
  }

  outputLabel (): string {
    return this.label ?? this.constructor.name
  }

  lostSynchronization (): void {}
  synchronized (): void {}
}

function canRead (buffer: Buffer, primitive: Primitive, offset: number): boolean {
  if (primitive === 'u8' || primitive === 'i8') {
    return Buffer.byteLength(buffer) - offset >= 1
  }

  if (primitive === 'u16l' || primitive === 'u16b' || primitive === 'i16l' || primitive === 'i16b') {
    return Buffer.byteLength(buffer) - offset >= 2
  }

  if (primitive === 'u32l' || primitive === 'u32b' || primitive === 'i32l' || primitive === 'i32b' || primitive === 'f32l' || primitive === 'f32b') {
    return Buffer.byteLength(buffer) - offset >= 4
  }

  if (primitive === 'u64l' || primitive === 'u64b' || primitive === 'i64l' || primitive === 'i64b' || primitive === 'f64l' || primitive === 'f64b') {
    return Buffer.byteLength(buffer) - offset >= 4
  }

  return false
}

function read (buffer: Buffer, primitive: Primitive, offset: number): [number | bigint, number] {
  switch (primitive) {
    case 'u8': {
      return [buffer.readUInt8(offset), 1]
    }
    case 'u16l': {
      return [buffer.readUInt16LE(offset), 2]
    }
    case 'u16b': {
      return [buffer.readUInt16BE(offset), 2]
    }
    case 'u32l': {
      return [buffer.readUInt32LE(offset), 4]
    }
    case 'u32b': {
      return [buffer.readUInt32BE(offset), 4]
    }
    case 'u64l': {
      return [buffer.readBigUInt64LE(offset), 8]
    }
    case 'u64b': {
      return [buffer.readBigUInt64BE(offset), 8]
    }
    case 'i8': {
      return [buffer.readInt8(offset), 1]
    }
    case 'i16l': {
      return [buffer.readInt16LE(offset), 2]
    }
    case 'i16b': {
      return [buffer.readInt16BE(offset), 2]
    }
    case 'i32l': {
      return [buffer.readInt32LE(offset), 4]
    }
    case 'i32b': {
      return [buffer.readInt32BE(offset), 4]
    }
    case 'i64l': {
      return [buffer.readBigInt64LE(offset), 8]
    }
    case 'i64b': {
      return [buffer.readBigInt64BE(offset), 8]
    }
    case 'f32l': {
      return [buffer.readFloatLE(offset), 4]
    }
    case 'f32b': {
      return [buffer.readFloatBE(offset), 4]
    }
    case 'f64l': {
      return [buffer.readDoubleLE(offset), 8]
    }
    case 'f64b': {
      return [buffer.readDoubleBE(offset), 8]
    }
  }
}
