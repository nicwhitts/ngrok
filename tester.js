var ffi = require('ffi-napi')
const { defaults, validate } = require('./src/utils')
const { join } = require('path')
const platform = require('os').platform()
const { startServer } = require('./server')
// const start = ['start', '--none', '--log=stdout']

var lib = ffi.Library(null, {
  // FILE* popen(char* cmd, char* mode);
  popen: ['pointer', ['string', 'string']],

  // void pclose(FILE* fp);
  pclose: ['void', ['pointer']],

  // char* fgets(char* buff, int buff, in)
  fgets: ['string', ['string', 'int', 'pointer']],
})

function execSync(cmd) {
  var buffer = new Buffer(1024),
    result = '',
    fp = lib.popen(cmd, 'r', function (e, res) {
      console.log(e, res)
    })

  if (!fp) throw new Error('execSync error: ' + cmd)

  while (lib.fgets(buffer, 1024, fp)) {
    const line = buffer.readCString()
    result += line
    console.log(line)
  }
  lib.pclose(fp)

  //   return result
}

function execAsync(cmd) {
  lib.popen.async(cmd, 'r', function (e, fp) {
    if (!fp) throw new Error('execAsync error: ' + cmd)

    console.log(e)
    console.log(fp)

    while (lib.fgets(fp, 1024, fp)) {
      const line = buffer.readCString()
      console.log(line)
    }
    lib.pclose(fp)
  })

  //   return result
}

var libc = new ffi.Library(null, {
  system: ['int32', ['string']],
})

var run = libc.system

async function connect() {
  startServer()
  const defaultDir = join(__dirname, '..', 'bin')
  const bin = platform === 'win32' ? 'ngrok.exe' : './ngrok'

  let opts = defaults({ proto: 'tcp', addr: 3333 })
  validate(opts)
  if (opts.authtoken) {
    await setAuthtoken(opts)
  }
  let dir = defaultDir
  //   const start = ['start', '--none', '--log=stdout']
  if (opts.region) start.push('--region=' + opts.region)
  if (opts.configPath) start.push('--config=' + opts.configPath)
  if (opts.binPath) dir = opts.binPath(dir)

  run.async(` cd ${dir} && ${bin} tcp 3333 --log=stdout`, function (err, res) {
    console.log(err, res)
  })
}

connect()
// execAsync('/Users/Nic/bin/ngrok tcp 1081 --log=stdout')
