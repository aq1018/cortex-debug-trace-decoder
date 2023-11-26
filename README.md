[![Test](https://github.com/aq1018/cortex-debug-trace-decoder/actions/workflows/test.yml/badge.svg)](https://github.com/aq1018/cortex-debug-trace-decoder/actions/workflows/test.yml)

# Cortex-Debug Trace Decoder

Trace Decoder is a custom advanced swo/rtt decoder for Visual Studio Code [Cortex-Debug](https://github.com/Marus/cortex-debug) extension. This decoder can parse a variety of mixed data types from the same swo/rtt channel(s) and send the parsed values to real time graphs.

## Example Configuration

Here is a sample configration for `rttConfig.decoders` portion.

```json
{
  "type": "advanced",

  // change this to where you downloaded the decoder file.
  "decoder": "${workspaceRoot}/.vscode/cortex-debug-trace-decoder/index.js",

  // listen to rtt / swo port 1 and 2.
  "ports": [1, 2],

  "config": {
    "label": "motor-controller",
    "ports": [
      {
        // configure traces for rtt / swo port 1
        "port": 1,

        // We expect port 1 trace data to be formatted as a stream of (u16l, f32l) tuples.
        "traces": [
          {
            // 16 bit unsigned integer, little endian
            "primitive": "u16l",

            // graphId is used in `graphConfig` section.
            // For more details see: https://github.com/Marus/cortex-debug/wiki/SWO-Output#output-graphing-graphing
            "graphId": "motor_pwm",
          },
          {
            // 32 bit float, little endian
            "primitive": "f32l",
            "graphId": "motor_current",
          },
        ]
      },
      {
        // configure traces for rtt / swo port 2
        "port": 2,
        "traces": [
          {
            "primitive": "u16l",
            "graphId": "TIM1_count",
          },
          {
            "primitive": "u16l",
            "graphId": "TIM2_count",
          },
        ]
      }
    ]
  },
}
```

## Supported Primitives

| Primitive   | Bit  | Sign      | Type     | Endian  |
|-----------  |----  |---------  | -------  | ------  |
| `u8`        | 8    | unsigned  | integer  | N/A     |
| `i8`        | 8    | signed    | integer  | N/A     |
| `u16l`      | 16   | unsigned  | integer  | little  |
| `u16b`      | 16   | unsigned  | integer  | big     |
| `i16l`      | 16   | signed    | integer  | little  |
| `i16b`      | 16   | signed    | integer  | big     |
| `u32l`      | 32   | unsigned  | integer  | little  |
| `u32b`      | 32   | unsigned  | integer  | big     |
| `i32l`      | 32   | signed    | integer  | little  |
| `i32b`      | 32   | signed    | integer  | big     |
| `u64l`      | 64   | unsigned  | integer  | little  |
| `u64b`      | 64   | unsigned  | integer  | big     |
| `i64l`      | 64   | signed    | integer  | little  |
| `i64b`      | 64   | signed    | integer  | big     |
| `f32l`      | 32   | signed    | float    | little  |
| `f32b`      | 32   | signed    | float    | big     |
| `f64l`      | 64   | signed    | double   | little  |
| `f64b`      | 64   | signed    | double   | big     |
