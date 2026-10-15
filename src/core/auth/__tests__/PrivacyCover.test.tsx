import React from 'react';
import { AppState } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { PrivacyCover } from '../components/PrivacyCover';

it('covers content whenever the app is not active', () => {
  let handler: (s: string) => void = () => {};
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, h: never) => {
    handler = h;
    return { remove: jest.fn() };
  }) as never);
  const { queryByTestId } = render(<PrivacyCover />);
  expect(queryByTestId('privacy-cover')).toBeNull();
  act(() => handler('inactive'));
  expect(queryByTestId('privacy-cover')).not.toBeNull();
  act(() => handler('active'));
  expect(queryByTestId('privacy-cover')).toBeNull();
});
