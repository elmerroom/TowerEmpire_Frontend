/**
 * Unit tests for compare strategies
 */

import { describe, it, expect } from 'vitest';
import {
  compareFingerprintArray,
  compareByVersion,
  compareDeep,
  compare,
  determineUpdatePolicy,
} from './compareStrategies';

describe('compareFingerprintArray', () => {
  it('should return no_current when current is empty', () => {
    const incoming = [{ id: 1, name: 'Alice', is_host: true }];
    const current: any[] = [];

    const result = compareFingerprintArray(incoming, current);

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('no_current');
    expect(result.stats?.addedItems).toBe(1);
  });

  it('should return identical when fingerprints match', () => {
    const players = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
      {
        id: 2,
        user_id: 2,
        name: 'Bob',
        is_host: false,
        is_disconnect: false,
        points: 5,
        avatar: null,
        nickname_color: '#AAA',
        is_vip: false,
      },
    ];

    const result = compareFingerprintArray(players, players);

    expect(result.shouldUpdate).toBe(false);
    expect(result.reason).toBe('identical');
    expect(result.stats?.changedItems).toBe(0);
  });

  it('should detect changed player', () => {
    const current = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];
    const incoming = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: false,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    const result = compareFingerprintArray(incoming, current);

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('fingerprint_diff');
    expect(result.stats?.changedItems).toBe(1);
  });

  it('should detect added player', () => {
    const current = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];
    const incoming = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
      {
        id: 2,
        user_id: 2,
        name: 'Bob',
        is_host: false,
        is_disconnect: false,
        points: 0,
        avatar: null,
        nickname_color: '#AAA',
        is_vip: false,
      },
    ];

    const result = compareFingerprintArray(incoming, current);

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('fingerprint_diff');
    expect(result.stats?.addedItems).toBe(1);
  });

  it('should detect removed player', () => {
    const current = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
      {
        id: 2,
        user_id: 2,
        name: 'Bob',
        is_host: false,
        is_disconnect: false,
        points: 0,
        avatar: null,
        nickname_color: '#AAA',
        is_vip: false,
      },
    ];
    const incoming = [
      {
        id: 1,
        user_id: 1,
        name: 'Alice',
        is_host: true,
        is_disconnect: false,
        points: 10,
        avatar: null,
        nickname_color: '#FFF',
        is_vip: false,
      },
    ];

    const result = compareFingerprintArray(incoming, current);

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('fingerprint_diff');
    expect(result.stats?.removedItems).toBe(1);
  });
});

describe('compareByVersion', () => {
  it('should return no_current when current is null', () => {
    const incoming = { current_round: 5 };
    const current = null;

    const result = compareByVersion(incoming, current, 'current_round');

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('no_current');
  });

  it('should return identical when versions match', () => {
    const incoming = { current_round: 5 };
    const current = { current_round: 5 };

    const result = compareByVersion(incoming, current, 'current_round');

    expect(result.shouldUpdate).toBe(false);
    expect(result.reason).toBe('identical');
  });

  it('should return version_bump when incoming version is higher', () => {
    const incoming = { current_round: 6 };
    const current = { current_round: 5 };

    const result = compareByVersion(incoming, current, 'current_round');

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('version_bump');
  });

  it('should skip stale data (incoming < current)', () => {
    const incoming = { current_round: 4 };
    const current = { current_round: 5 };

    const result = compareByVersion(incoming, current, 'current_round');

    expect(result.shouldUpdate).toBe(false);
    expect(result.reason).toBe('identical');
  });

  it('should fallback to deep compare when version field missing', () => {
    const incoming = { data: 'new' };
    const current = { data: 'old' };

    const result = compareByVersion(incoming, current, 'version');

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('deep_diff');
  });
});

describe('compareDeep', () => {
  it('should return no_current when current is null', () => {
    const incoming = { foo: 'bar' };
    const current = null;

    const result = compareDeep(incoming, current);

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('no_current');
  });

  it('should return identical when objects match', () => {
    const obj = { foo: 'bar', nested: { value: 42 } };

    const result = compareDeep(obj, obj);

    expect(result.shouldUpdate).toBe(false);
    expect(result.reason).toBe('identical');
  });

  it('should detect deep differences', () => {
    const incoming = { foo: 'bar', nested: { value: 43 } };
    const current = { foo: 'bar', nested: { value: 42 } };

    const result = compareDeep(incoming, current);

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('deep_diff');
  });
});

describe('compare (main function)', () => {
  it('should use fingerprint strategy for arrays', () => {
    const incoming = [{ id: 1, name: 'Alice' }];
    const current = [{ id: 1, name: 'Alice' }];

    const result = compare(incoming, current, { strategy: 'fingerprint' });

    expect(result.shouldUpdate).toBe(false);
    expect(result.reason).toBe('identical');
  });

  it('should use version strategy', () => {
    const incoming = { round: 5 };
    const current = { round: 4 };

    const result = compare(incoming, current, {
      strategy: 'version',
      versionField: 'round',
    });

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('version_bump');
  });

  it('should use deep strategy', () => {
    const incoming = { settings: { censorship: true } };
    const current = { settings: { censorship: false } };

    const result = compare(incoming, current, { strategy: 'deep' });

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('deep_diff');
  });

  it('should always update with always strategy', () => {
    const incoming = { data: 'same' };
    const current = { data: 'same' };

    const result = compare(incoming, current, { strategy: 'always' });

    expect(result.shouldUpdate).toBe(true);
    expect(result.reason).toBe('always');
  });
});

describe('determineUpdatePolicy', () => {
  it('should return skip when shouldUpdate is false', () => {
    const result = { shouldUpdate: false, reason: 'identical' as const };

    const policy = determineUpdatePolicy(result);

    expect(policy).toBe('skip');
  });

  it('should return replaceAll when no stats', () => {
    const result = { shouldUpdate: true, reason: 'always' as const };

    const policy = determineUpdatePolicy(result);

    expect(policy).toBe('replaceAll');
  });

  it('should return replaceAll when items removed', () => {
    const result = {
      shouldUpdate: true,
      reason: 'fingerprint_diff' as const,
      stats: { totalItems: 2, changedItems: 0, addedItems: 0, removedItems: 1 },
    };

    const policy = determineUpdatePolicy(result);

    expect(policy).toBe('replaceAll');
  });

  it('should return replaceAll when >50% changed', () => {
    const result = {
      shouldUpdate: true,
      reason: 'fingerprint_diff' as const,
      stats: {
        totalItems: 10,
        changedItems: 6,
        addedItems: 0,
        removedItems: 0,
      },
    };

    const policy = determineUpdatePolicy(result);

    expect(policy).toBe('replaceAll');
  });

  it('should return upsertMany when <50% changed', () => {
    const result = {
      shouldUpdate: true,
      reason: 'fingerprint_diff' as const,
      stats: {
        totalItems: 10,
        changedItems: 2,
        addedItems: 1,
        removedItems: 0,
      },
    };

    const policy = determineUpdatePolicy(result);

    expect(policy).toBe('upsertMany');
  });

  it('should return skip when no changes', () => {
    const result = {
      shouldUpdate: true,
      reason: 'fingerprint_diff' as const,
      stats: { totalItems: 5, changedItems: 0, addedItems: 0, removedItems: 0 },
    };

    const policy = determineUpdatePolicy(result);

    expect(policy).toBe('skip');
  });
});
