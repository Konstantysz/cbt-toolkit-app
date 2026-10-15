import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { applyFontScale } from '../applyFontScale';
import { useSettings } from '../store';

describe('applyFontScale', () => {
  it('scales every Text by the font-size setting', () => {
    applyFontScale();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native');
    useSettings.setState({ fontSize: 'lg' });
    const { getByText } = render(<Text style={{ fontSize: 10, lineHeight: 20 }}>x</Text>);
    const flat = StyleSheet.flatten(getByText('x').props.style);
    expect(flat.fontSize).toBeCloseTo(12);
    expect(flat.lineHeight).toBeCloseTo(24);
  });
});
