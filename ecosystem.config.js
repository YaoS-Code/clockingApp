module.exports = {
  apps: [
    {
      name: 'client',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './client/build',
        PM2_SERVE_PORT: 3001,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'server',
      script: './server/src/app.js',
      env: {
        PORT: 13000,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'http://clock.mmcwellness.ca'
      }
    }
  ]
};
