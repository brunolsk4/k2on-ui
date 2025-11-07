const nextConfig = {
  basePath: '/app',
  async rewrites() {
    // Corrige requisições relativas (ex: /app/wizard/vendas.png) apontando para /app/vendas.png
    return [
      {
        source: '/:any*/:file(vendas|performance|marketing|google-ads|active|bitrix|pipedrive|hotmart|api4com|kiwify).png',
        destination: '/:file.png',
      },
    ]
  },
  turbopack: {
    // Define explicitamente a raiz do projeto UI para silenciar o aviso
    root: __dirname,
  },
};
export default nextConfig;
