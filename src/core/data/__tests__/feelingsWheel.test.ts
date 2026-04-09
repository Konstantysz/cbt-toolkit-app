import { feelingsWheel, EmotionNode } from '../feelingsWheel';

function flattenNodes(nodes: EmotionNode[]): EmotionNode[] {
  return nodes.flatMap((n) => [n, ...flattenNodes(n.children ?? [])]);
}

describe('feelingsWheel', () => {
  const all = flattenNodes(feelingsWheel);

  it('has 150 nodes total', () => {
    expect(all).toHaveLength(150);
  });

  it('has 6 root nodes at level 1', () => {
    expect(feelingsWheel).toHaveLength(6);
    feelingsWheel.forEach((n) => expect(n.level).toBe(1));
  });

  it('each root has exactly 6 level-2 children', () => {
    feelingsWheel.forEach((root) => {
      expect(root.children).toHaveLength(6);
      root.children!.forEach((c) => expect(c.level).toBe(2));
    });
  });

  it('each level-2 node has exactly 3 level-3 children', () => {
    feelingsWheel.forEach((root) => {
      root.children!.forEach((l2) => {
        expect(l2.children).toHaveLength(3);
        l2.children!.forEach((c) => expect(c.level).toBe(3));
      });
    });
  });

  it('all keys are unique', () => {
    const keys = all.map((n) => n.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('every level > 1 node has a parentKey that exists', () => {
    const keySet = new Set(all.map((n) => n.key));
    all
      .filter((n) => n.level > 1)
      .forEach((n) => {
        expect(n.parentKey).toBeDefined();
        expect(keySet.has(n.parentKey!)).toBe(true);
      });
  });

  it('each node has a non-empty label and valid hex color', () => {
    const hexRe = /^#[0-9a-fA-F]{6}$/;
    all.forEach((n) => {
      expect(n.label.length).toBeGreaterThan(0);
      expect(hexRe.test(n.color)).toBe(true);
    });
  });
});
