// next.config.js
module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',  // Frontend path pattern
                destination: 'https://newsaless-2.onrender.com/:path*', // Backend URL pattern
            },
        ]
    },
}
