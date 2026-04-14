import path from "node:path"
import { fileURLToPath } from "node:url"
import createNextIntlPlugin from "next-intl/plugin"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

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
        destination: "/en/services",
        permanent: true,
      },
      {
        source: "/capabilities",
        destination: "/en/services",
        permanent: true,
      },
      {
        source: "/what-we-build",
        destination: "/en/services",
        permanent: true,
      },
      {
        source: "/technology-we-use",
        destination: "/en/about#technology",
        permanent: true,
      },
      {
        source: "/about-noon",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/work-with-noon",
        destination: "/en/contact",
        permanent: true,
      },
      {
        source: "/next-product",
        destination: "/en/contact",
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

export default withNextIntl(nextConfig)
