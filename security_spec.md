# User Management Security Specification

## 1. Data Invariants
- A user document must match the `request.auth.uid`.
- Roles can only be modified by existing 'admin' users.
- Permissions for 'agent' users can only be modified by 'admin' users.
- All write operations must include `updatedAt` as `request.time`.
- Creation of a user profile must set default role as 'client' and empty permissions.

## 2. The Dirty Dozen Payloads (Attack Vectors)
1. **Self-Promotion**: Client trying to update their own role to 'admin'.
2. **Permission Escalation**: Agent trying to give themselves `deleteLead` permission.
3. **Orphaned Writes**: Writing a booking with a fake `uid`.
4. **Data Scraping**: Authenticated user trying to list all `leads` without `viewLeads` permission.
5. **Shadow Fields**: Adding an `isVerified: true` field to a user profile.
6. **ID Poisoning**: Creating a review with a 2KB string as ID.
7. **Timestamp Spoofing**: Setting `createdAt` to a future date.
8. **Resource Exhaustion**: Sending a 1MB string in the `details` field of a log.
9. **Role Hopping**: Agent trying to change another agent's role.
10. **PII Leak**: Non-admin user trying to read another user's email from the `users` collection.
11. **Action Bypass**: Agent trying to update `bookings` status without `manageBookings` permission.
12. **Settings Graffiti**: Non-admin/agent trying to update `hero_settings`.

## 3. Test Runner (Security Invariants)

```typescript
// firestore.rules.test.ts
// (Conceptual tests to be implemented in a real test environment)
// 1. expect(client.update('users/my-uid', { role: 'admin' })).toBeDenied();
// 2. expect(agent.update('users/agent-uid', { permissions: { deleteLead: true } })).toBeDenied();
// 3. expect(guest.list('leads')).toBeDenied();
// 4. expect(admin.update('users/some-uid', { role: 'agent' })).toBeAllowed();
```
