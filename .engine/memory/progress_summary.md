Phase: implementing. Slice 2 of 4: auth (scaffold done+committed).
Files: backend/src/{types/index.ts,middleware/validate.ts,services/auth.service.ts,routes/auth.routes.ts,__tests__/auth.service.test.ts}, frontend/{lib/api.ts,context/BookingContext.tsx,components/FormField.tsx,app/login/page.tsx,app/login/otp/page.tsx,src/__tests__/LoginPage.test.tsx,e2e/auth.spec.ts}
Verify: cd backend && node node_modules/vitest/vitest.mjs run src/__tests__/auth.service.test.ts
Note: mount auth router in backend/src/app.ts. Next after auth: catalog slice.