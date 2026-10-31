import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  // The repository keeps one AGENTS.md; next dev would otherwise write its own into apps/docs.
  agentRules: false,
}

export default nextConfig
