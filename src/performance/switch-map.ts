import { measure } from '@/core';

/**
 * Performance test comparing switch statement vs map lookup
 */
measure.ftest('Switch Map', () => {
  /**
   * Generate test keys (a-z, aa-zx for 100 total cases)
   */
  const generateKeys = () => {
    const keys = [];
    // Single letters a-z (26 keys)
    for (let i = 0; i < 26; i++) {
      keys.push(String.fromCharCode(97 + i));
    }
    // Double letters aa-zx (74 more keys for total of 100)
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        if (keys.length >= 100) break;
        keys.push(String.fromCharCode(97 + i) + String.fromCharCode(97 + j));
      }
      if (keys.length >= 100) break;
    }
    return keys.slice(0, 100);
  };

  const testKeys = generateKeys();

  measure.addConfig({ runTime: 1e7 }, () => {
    const n = Math.floor(Math.random() * 100);
    return testKeys[n];
  });

  /**
   * Map object with 100 key-value pairs
   */
  const map: Record<string, () => number> = {};
  testKeys.forEach((key) => {
    map[key] = () => 0;
  });

  /**
   * Switch statement performance test
   * @param config - Test configuration
   * @param k - Key to switch on
   */
  measure.add('switch', (config, k) => {
    switch (k) {
      case 'a':
        return 1;
      case 'b':
        return 1;
      case 'c':
        return 1;
      case 'd':
        return 1;
      case 'e':
        return 1;
      case 'f':
        return 1;
      case 'g':
        return 1;
      case 'h':
        return 1;
      case 'i':
        return 1;
      case 'j':
        return 1;
      case 'k':
        return 1;
      case 'l':
        return 1;
      case 'm':
        return 1;
      case 'n':
        return 1;
      case 'o':
        return 1;
      case 'p':
        return 1;
      case 'q':
        return 1;
      case 'r':
        return 1;
      case 's':
        return 1;
      case 't':
        return 1;
      case 'u':
        return 1;
      case 'v':
        return 1;
      case 'w':
        return 1;
      case 'x':
        return 1;
      case 'y':
        return 1;
      case 'z':
        return 1;
      case 'aa':
        return 1;
      case 'ab':
        return 1;
      case 'ac':
        return 1;
      case 'ad':
        return 1;
      case 'ae':
        return 1;
      case 'af':
        return 1;
      case 'ag':
        return 1;
      case 'ah':
        return 1;
      case 'ai':
        return 1;
      case 'aj':
        return 1;
      case 'ak':
        return 1;
      case 'al':
        return 1;
      case 'am':
        return 1;
      case 'an':
        return 1;
      case 'ao':
        return 1;
      case 'ap':
        return 1;
      case 'aq':
        return 1;
      case 'ar':
        return 1;
      case 'as':
        return 1;
      case 'at':
        return 1;
      case 'au':
        return 1;
      case 'av':
        return 1;
      case 'aw':
        return 1;
      case 'ax':
        return 1;
      case 'ay':
        return 1;
      case 'az':
        return 1;
      case 'ba':
        return 1;
      case 'bb':
        return 1;
      case 'bc':
        return 1;
      case 'bd':
        return 1;
      case 'be':
        return 1;
      case 'bf':
        return 1;
      case 'bg':
        return 1;
      case 'bh':
        return 1;
      case 'bi':
        return 1;
      case 'bj':
        return 1;
      case 'bk':
        return 1;
      case 'bl':
        return 1;
      case 'bm':
        return 1;
      case 'bn':
        return 1;
      case 'bo':
        return 1;
      case 'bp':
        return 1;
      case 'bq':
        return 1;
      case 'br':
        return 1;
      case 'bs':
        return 1;
      case 'bt':
        return 1;
      case 'bu':
        return 1;
      case 'bv':
        return 1;
      case 'bw':
        return 1;
      case 'bx':
        return 1;
      case 'by':
        return 1;
      case 'bz':
        return 1;
      case 'ca':
        return 1;
      case 'cb':
        return 1;
      case 'cc':
        return 1;
      case 'cd':
        return 1;
      case 'ce':
        return 1;
      case 'cf':
        return 1;
      case 'cg':
        return 1;
      case 'ch':
        return 1;
      case 'ci':
        return 1;
      case 'cj':
        return 1;
      case 'ck':
        return 1;
      case 'cl':
        return 1;
      case 'cm':
        return 1;
      case 'cn':
        return 1;
      case 'co':
        return 1;
      case 'cp':
        return 1;
      case 'cq':
        return 1;
      case 'cr':
        return 1;
      case 'cs':
        return 1;
      case 'ct':
        return 1;
      case 'cu':
        return 1;
      case 'cv':
        return 1;
      case 'cw':
        return 1;
      case 'cx':
        return 1;
      default:
        return 1;
    }
  });

  /**
   * Map lookup performance test
   * @param config - Test configuration
   * @param k - Key to lookup
   */
  measure.add('map', (config, k) => {
    return (map as any)[k]?.() ?? 2;
  });
});
