Phase: implementing. Slice 1 of 4: scaffold.
Files: .gitignore, docker-compose.yml, backend/{package.json,tsconfig.json,.env.example,.env,src/config.ts,src/index.ts,src/middleware/errorHandler.ts,Dockerfile}, frontend/{package.json,tsconfig.json,next.config.js,tailwind.config.ts,postcss.config.js,.env.example,app/layout.tsx,app/globals.css,app/page.tsx,components/Header.tsx,components/Button.tsx,Dockerfile}
Verify: cd backend && node node_modules/typescript/bin/tsc && node node_modules/vitest/vitest.mjs run
Next after scaffold: auth slice.