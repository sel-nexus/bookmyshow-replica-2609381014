Phase: implementing. Slice 4 of 4: booking (scaffold+auth+catalog done+committed).
Files: backend/src/{services/bookings.service.ts,routes/bookings.routes.ts,__tests__/bookings.service.test.ts}, frontend/{components/LoadingSpinner.tsx,app/seats/page.tsx,app/payment/page.tsx,app/success/page.tsx,src/__tests__/PaymentPage.test.tsx}
Verify: cd backend && node node_modules/vitest/vitest.mjs run src/__tests__/bookings.service.test.ts
Note: mount bookings router in backend/src/app.ts. This is the last feature slice; then TESTING phase (critic loop, integration, E2E).