import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    // Paksa Turbopack cari modules dari folder app/ bukan parent folder
    root: path.resolve(__dirname),
  },
}

export default nextConfig