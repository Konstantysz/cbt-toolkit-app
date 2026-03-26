const React = require('react');
const { View } = require('react-native');

const mockIcon = (displayName) => {
  const Icon = (props) => React.createElement(View, props);
  Icon.displayName = displayName;
  return Icon;
};

module.exports = {
  Ionicons: mockIcon('Ionicons'),
  MaterialIcons: mockIcon('MaterialIcons'),
  FontAwesome: mockIcon('FontAwesome'),
  AntDesign: mockIcon('AntDesign'),
  Feather: mockIcon('Feather'),
};
