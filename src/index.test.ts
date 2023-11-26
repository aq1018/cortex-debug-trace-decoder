import TraceDecoder, { type PortConfig } from '.'

describe('TraceDecoder', () => {
  function buildDecoder (ports: PortConfig[] = [], graphData = jest.fn()): TraceDecoder {
    const decoder = new TraceDecoder()
    decoder.init({
      type: 'advanced',
      ports: [1],
      decoder: 'decoder.js',
      config: {
        label: 'my label',
        ports
      }
    }, jest.fn(), graphData)
    return decoder
  }

  describe('.type()', () => {
    test('returns type from config', () => {
      const decoder = buildDecoder()
      expect(decoder.typeName()).toEqual('advanced')
    })
  })

  describe('.outputLabel()', () => {
    test('returns label from config', () => {
      const decoder = buildDecoder()
      expect(decoder.outputLabel()).toEqual('my label')
    })
  })

  describe('.softwareEvent()', () => {
    test('saves left over buffer', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [
          // 2 bytes
          { primitive: 'u16l', graphId: 'g1' },
          // 4 bytes
          { primitive: 'f32l', graphId: 'g2' }
        ]
      }], graphData)

      const buffer = Buffer.alloc(6)
      buffer.writeUint16LE(42, 0)
      buffer.writeFloatLE(0.5, 2)

      const b1 = buffer.subarray(0, 3)
      const b2 = buffer.subarray(3, 6)

      decoder.softwareEvent(1, b1)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(42)
      expect(graphData.mock.calls[0][1]).toEqual('g1')

      decoder.softwareEvent(1, b2)
      expect(graphData.mock.calls).toHaveLength(2)
      expect(graphData.mock.calls[1][0]).toEqual(0.5)
      expect(graphData.mock.calls[1][1]).toEqual('g2')
    })

    test('does not parse unknown channels', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u8', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(1)
      buffer.writeUInt8(42)

      decoder.softwareEvent(2, buffer)
      expect(graphData.mock.calls).toHaveLength(0)
    })

    test('parses u8', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u8', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(1)
      buffer.writeUInt8(42)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(42)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses u16l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u16l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(2)
      buffer.writeUint16LE(256)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(256)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses u16b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u16b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(2)
      buffer.writeUint16BE(256)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(256)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses u32l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u32l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(4)
      buffer.writeUint32LE(65536)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(65536)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses u32b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u32b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(4)
      buffer.writeUint32BE(65536)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(65536)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses u64l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u64l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(8)
      buffer.writeBigUInt64LE(4294967296n)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(4294967296n)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses u64b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'u64b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(8)
      buffer.writeBigUInt64BE(4294967296n)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(4294967296n)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i8', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i8', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(1)
      buffer.writeInt8(-42)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-42)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i16l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i16l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(2)
      buffer.writeInt16LE(-256)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-256)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i16b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i16b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(2)
      buffer.writeInt16BE(-256)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-256)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i32l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i32l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(4)
      buffer.writeInt32LE(-65536)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-65536)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i32b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i32b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(4)
      buffer.writeInt32BE(-65536)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-65536)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i64l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i64l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(8)
      buffer.writeBigInt64LE(-4294967296n)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-4294967296n)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses i64b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'i64b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(8)
      buffer.writeBigInt64BE(-4294967296n)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(-4294967296n)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses f32l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'f32l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(4)
      buffer.writeFloatLE(3.5)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(3.5)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses f32b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'f32b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(4)
      buffer.writeFloatBE(3.5)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(3.5)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses f64l', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'f64l', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(8)
      buffer.writeDoubleLE(3.1415926)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(3.1415926)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })

    test('parses f64b', () => {
      const graphData = jest.fn()
      const decoder = buildDecoder([{
        port: 1,
        traces: [{ primitive: 'f64b', graphId: 'g1' }]
      }], graphData)

      const buffer = Buffer.alloc(8)
      buffer.writeDoubleBE(3.1415926)

      decoder.softwareEvent(1, buffer)
      expect(graphData.mock.calls).toHaveLength(1)
      expect(graphData.mock.calls[0][0]).toEqual(3.1415926)
      expect(graphData.mock.calls[0][1]).toEqual('g1')
    })
  })
})
