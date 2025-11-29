import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to avoid "import statement outside a module" error
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock WorkOS AuthKit
jest.mock('@workos-inc/authkit-react', () => ({
  AuthKitProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: { firstName: 'TestUser', email: 'test@example.com' }, // Simulate logged in
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));

test('renders QuoteBot form with file input', () => {
  render(<App />);

  // When logged in, we expect to see the form title "Nueva Cotización"
  const titleElement = screen.getByText(/Nueva Cotización/i);
  expect(titleElement).toBeInTheDocument();

  // Check for user greeting
  expect(screen.getByText(/TestUser/i)).toBeInTheDocument();

  // Check for file input
  // Note: input type="file" doesn't have a role of 'textbox', so we use getByLabelText or selector
  const fileInput = screen.getByLabelText(/Fotos del problema/i);
  expect(fileInput).toBeInTheDocument();
});
