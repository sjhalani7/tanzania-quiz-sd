// __tests__/difficultySelection.test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import DifficultySelection from '../app/difficultySelection';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useLocalSearchParams: () => ({
    topic_num: '1'
  })
}));

describe('DifficultySelection', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders correctly', () => {
    const tree = renderer.create(<DifficultySelection />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders three difficulty buttons', () => {
    const component = renderer.create(<DifficultySelection />);
    const buttons = component.root.findAllByType(TouchableOpacity);
    expect(buttons).toHaveLength(3);
  });

  it('navigates correctly when selecting difficulty', () => {
    const component = renderer.create(<DifficultySelection />);
    const buttons = component.root.findAllByType(TouchableOpacity);
    
    // Test Easy difficulty
    const easyButton = buttons.find(button => 
      button.props.children.props.children === 'Easy'
    );
    easyButton.props.onPress();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/questionViewerTF',
      params: { topic_num: '1', difficulty: 'Easy' }
    });

    // Test Medium difficulty
    const mediumButton = buttons.find(button => 
      button.props.children.props.children === 'Medium'
    );
    mediumButton.props.onPress();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/questionViewerMC',
      params: { topic_num: '1', difficulty: 'Medium' }
    });

    // Test Hard difficulty
    const hardButton = buttons.find(button => 
      button.props.children.props.children === 'Hard'
    );
    hardButton.props.onPress();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/questionViewerFR',
      params: { topic_num: '1', difficulty: 'Hard' }
    });
  });

  it('contains correct difficulty labels', () => {
    const component = renderer.create(<DifficultySelection />);
    const root = component.root;

    const difficultyLabels = ['Easy', 'Medium', 'Hard'];
    
    difficultyLabels.forEach(label => {
      const buttonWithLabel = root.findAll(
        instance => instance.props.children === label
      );
      expect(buttonWithLabel.length).toBeGreaterThan(0);
    });
  });
});