module.exports = {
  apps: [
    {
      name: "userserver",
      cwd: "./userserver",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "adminserver",
      cwd: "./adminserver",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    {
      name: "deliveryserver",
      cwd: "./deliveryserver",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4001,
      },
    },
    {
      name: "superadminserver",
      cwd: "./superadminserver",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
  ],
};
