const React = require('react');
const RN = require('react-native');

const mock = (name) => {
  return ({ children, ...props }) => React.createElement(RN.View, props, children);
};

module.exports = {
  Svg: mock('Svg'),
  Rect: mock('Rect'),
  Line: mock('Line'),
  Path: mock('Path'),
  Text: mock('Text'),
  Defs: mock('Defs'),
  Marker: mock('Marker'),
  Circle: mock('Circle'),
  G: mock('G'),
  default: mock('Svg'),
};
