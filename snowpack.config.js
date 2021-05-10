const glslify = require('snowpack-plugin-glslify');

module.exports = {
  plugins: [
    ["snowpack-plugin-raw-file-loader", {
      exts: [".glsl"], 
    }],
    'snowpack-plugin-glslify'
  ],
}
