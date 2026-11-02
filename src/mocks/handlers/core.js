import { http, HttpResponse } from 'msw';
import { match } from '../utils';

export const coreHandlers = [
  // Версия
  http.get(match('core/version/'), async () => {
    return HttpResponse.json({ version: 'mock-0.1.0' });
  }),
];
