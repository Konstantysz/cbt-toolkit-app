import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type Text as RNText,
  type TextProps,
  type TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';
import { useSettings } from './store';
import { scaledFont } from './fontScale';

// require (not import *) so we patch the real module object, not an interop copy
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RN: typeof import('react-native') = require('react-native');

const DEFAULT_FONT_SIZE = 14;

function useScaledStyle(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const size = useSettings((s) => s.fontSize);
  if (size === 'md') return style;
  const flat = StyleSheet.flatten(style) ?? {};
  return [
    style,
    {
      fontSize: scaledFont(flat.fontSize ?? DEFAULT_FONT_SIZE, size),
      ...(flat.lineHeight ? { lineHeight: scaledFont(flat.lineHeight, size) } : null),
    },
  ];
}

const BaseText = RN.Text;
const BaseTextInput = RN.TextInput;

const ScaledText = React.forwardRef<RNText, TextProps>(function ScaledText(props, ref) {
  const style = useScaledStyle(props.style);
  return <BaseText {...props} ref={ref} style={style} />;
});

const ScaledTextInput = React.forwardRef<RNTextInput, TextInputProps>(
  function ScaledTextInput(props, ref) {
    const style = useScaledStyle(props.style);
    return <BaseTextInput {...props} ref={ref} style={style} />;
  }
);

/**
 * Makes the in-app font-size setting apply to every <Text>/<TextInput> in the app
 * by swapping react-native's lazy exports. Call once, before the first render.
 * ponytail: monkeypatch; replace with a shared AppText if screens are migrated.
 */
export function applyFontScale(): void {
  Object.defineProperty(RN, 'Text', { get: () => ScaledText, configurable: true });
  Object.defineProperty(RN, 'TextInput', { get: () => ScaledTextInput, configurable: true });
}
