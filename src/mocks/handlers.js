import { coreHandlers } from './handlers/core';
import { authHandlers } from './handlers/auth';
import { usersHandlers } from './handlers/users';
import { lobbyHandlers } from './handlers/lobby';
import { fuflHandlers } from './handlers/fufl';

export const handlers = [
  ...coreHandlers,
  ...authHandlers,
  ...usersHandlers,
  ...lobbyHandlers,
  ...fuflHandlers,
];
