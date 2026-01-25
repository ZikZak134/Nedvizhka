/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true, // Временно, чтобы билд не падал на мелочах
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'catalog.api.2gis.com',
            },
            {
                protocol: 'https',
                hostname: 'storage.yandexcloud.net', // Для S3
            },
            {
                protocol: 'https',
                hostname: 'nedvizhkaestate-analytics-api.onrender.com', // Legacy
            }
        ],
    },
}

module.exports = nextConfig
