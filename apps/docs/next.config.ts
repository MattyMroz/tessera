import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  agentRules: false,
  experimental: { cpus: 4 },
}

export default nextConfig
