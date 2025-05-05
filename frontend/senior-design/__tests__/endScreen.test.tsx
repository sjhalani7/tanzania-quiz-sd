// __tests__/endScreen.test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import EndScreen from '../app/endScreen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
}));

describe('EndScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders correctly', () => {
    const tree = renderer.create(<EndScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('navigates to home on button press', () => {
    const component = renderer.create(<EndScreen />);
    const root = component.root;
    
    // Find TouchableOpacity by both type and child text content
    const button = root.findAll(
      instance => 
        instance.type === TouchableOpacity && 
        instance.props.children?.props?.children === 'Study More'
    )[0];
    
    expect(button).toBeTruthy();
    button.props.onPress();
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('contains correct text elements', () => {
    const component = renderer.create(<EndScreen />);
    const root = component.root;

    // Find text elements
    const titleElement = root.findByProps({ 
      children: 'Finished Studying Section'
    });
    const buttonTextElement = root.findAll(
      instance => instance.props.children === 'Study More'
    )[0];

    expect(titleElement).toBeTruthy();
    expect(buttonTextElement).toBeTruthy();
  });
});