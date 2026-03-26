import React from 'react';
import { render } from '@testing-library/react-native';
import { AbcGraph, truncateNodeText } from '../AbcGraph';

describe('truncateNodeText', () => {
  it('returns text unchanged when <= 40 chars', () => {
    expect(truncateNodeText('Short text')).toBe('Short text');
  });

  it('truncates text > 40 chars and adds ellipsis', () => {
    const long = 'A'.repeat(50);
    const result = truncateNodeText(long);
    expect(result).toBe('A'.repeat(40) + '…');
    expect(result.length).toBe(41);
  });

  it('handles empty string', () => {
    expect(truncateNodeText('')).toBe('');
  });
});

describe('AbcGraph', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(
        <AbcGraph
          situation="Sytuacja testowa"
          thoughts="Myśli testowe"
          behaviors="Zachowanie testowe"
          emotions="Emocje testowe"
          physicalSymptoms="Objawy testowe"
        />
      )
    ).not.toThrow();
  });

  it('shows truncated situation text', () => {
    const long = 'X'.repeat(60);
    const { UNSAFE_queryAllByProps } = render(
      <AbcGraph
        situation={long}
        thoughts=""
        behaviors=""
        emotions=""
        physicalSymptoms=""
      />
    );
    const expected = 'X'.repeat(40) + '…';
    // SvgText renders as RN.View in the mock, so we query by children prop
    const nodes = UNSAFE_queryAllByProps({ children: expected });
    expect(nodes.length).toBeGreaterThan(0);
  });
});
