import type { Access, FieldAccess } from 'payload';

export type Role = 'admin' | 'editor' | 'archivist' | 'reviewer' | 'researcher' | 'member';

/** Peran yang WAJIB MFA (SECURITY §4, RULES §1.4). */
export const MFA_REQUIRED_ROLES: Role[] = ['admin', 'editor', 'archivist', 'reviewer'];

const has = (req: any, ...roles: Role[]) => !!req.user && roles.includes(req.user.role);

export const isAdmin: Access = ({ req }) => has(req, 'admin');
export const isStaff: Access = ({ req }) => has(req, 'admin', 'editor', 'archivist');
export const isReviewer: Access = ({ req }) => has(req, 'admin', 'reviewer');
export const isAdminField: FieldAccess = ({ req }) => has(req, 'admin');

/**
 * Default deny untuk publik (SECURITY §5).
 * Item terbit yang ditarik narasumber TIDAK PERNAH lolos, meski statusnya published.
 */
export const publishedOnly: Access = ({ req }) => {
  if (has(req, 'admin', 'editor', 'archivist')) return true;
  return {
    and: [
      { _status: { equals: 'published' } },
      { withdrawalRequested: { equals: false } },
    ],
  };
};

export const denyAll: Access = () => false;
