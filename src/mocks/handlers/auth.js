import { http, HttpResponse } from 'msw';
import { users } from '../data';
import { match, makeJwt, findUserById } from '../utils';

export const authHandlers = [
  // Временная регистрация гостя
  http.post(match('users/create_temp/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const baseName = body?.username?.trim() || 'Guest';
    let uname = baseName;
    let i = 1;
    while (users.some(u => u.username === uname)) {
      uname = `${baseName}${i++}`;
    }
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    users.push({
      id: newId,
      username: uname,
      email: `${uname}@example.com`,
      avatar: null,
      nickname_color: '#4eb5b5',
      date_joined: new Date().toISOString(),
    });
    return HttpResponse.json({ username: uname });
  }),

  // Регистрация обычного пользователя
  http.post(match('users/create/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));

    const username = body?.username?.trim();
    const email = body?.email?.trim();
    const password = body?.password;
    const password_2 = body?.password_2;

    if (!username || username.length < 3) {
      return HttpResponse.json(
        { error: { username: { error: 'Неверный формат никнейма' } } },
        { status: 400 },
      );
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      return HttpResponse.json(
        { error: { email: { error: 'Неверный формат email' } } },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return HttpResponse.json(
        { error: { password: { error: 'Пароль не соответствует критериям' } } },
        { status: 400 },
      );
    }

    if (password !== password_2) {
      return HttpResponse.json(
        { error: { password: { error: 'Пароли не совпадают' } } },
        { status: 400 },
      );
    }

    return HttpResponse.json({ email });
  }),

  // Логин: по email/password или по username (гость)
  http.post(match('users/token/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    let user;
    if (body?.email && body?.password) {
      user = users.find(u => u.email === body.email);
      if (!user) {
        const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        user = {
          id: newId,
          username: body.email.split('@')[0],
          email: body.email,
          avatar: null,
          nickname_color: '#4eb5b5',
          date_joined: new Date().toISOString(),
        };
        users.push(user);
      }
    } else if (body?.username) {
      user = users.find(u => u.username === body.username);
      if (!user) {
        const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        user = {
          id: newId,
          username: body.username,
          email: `${body.username}@example.com`,
          avatar: null,
          nickname_color: '#4eb5b5',
          date_joined: new Date().toISOString(),
        };
        users.push(user);
      }
    } else {
      return HttpResponse.json(
        { detail: 'Неверные учетные данные' },
        { status: 400 },
      );
    }
    const access = makeJwt(user.id);
    const refresh = `refresh-${user.id}-${Date.now()}`;
    return HttpResponse.json({ data: { access, refresh } });
  }),

  // Обновление токена
  http.post(match('users/token/refresh/'), async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body?.refresh;
    if (!refreshToken) {
      return HttpResponse.json(
        { code: 'invalid_refresh', detail: 'Отсутствует refresh' },
        { status: 400 },
      );
    }
    const userId = users[0].id;
    const access = makeJwt(userId);
    const refresh = `refresh-${userId}-${Date.now()}`;
    return HttpResponse.json({ access, refresh });
  }),

  // Профиль пользователя
  http.get(match('users/:id/personal_area/'), async ({ params }) => {
    const user = findUserById(params.id);
    if (!user) {
      return HttpResponse.json(
        { code: 'user_not_found', detail: 'Пользователь не найден' },
        { status: 401 },
      );
    }
    const { username, email, date_joined, avatar } = user;
    return HttpResponse.json({
      username,
      email,
      date_joined,
      avatar,
      exp: 1234,
      rank: 'Новичок',
      dracoins: 0,
      is_vip: false,
      its_vip_time: null,
      is_active: true,
    });
  }),
];
