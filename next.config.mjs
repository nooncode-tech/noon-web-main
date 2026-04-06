import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: rootDir,
  },
  async redirects() {
    return [
      // Consolidated pages redirects
      {
        source: "/solutions",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/capabilities",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/what-we-build",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/technology-we-use",
        destination: "/about#technology",
        permanent: true,
      },
      {
        source: "/about-noon",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/work-with-noon",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/next-product",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/start-with-maxwell",
        destination: "/maxwell",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
