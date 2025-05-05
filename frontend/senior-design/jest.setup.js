// frontend/senior-design/jest.setup.js
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('react-ga4', () => ({
  initialize: jest.fn(),
  send: jest.fn(),
}));