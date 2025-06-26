import React from 'react';
import { render } from '@testing-library/react';
import Register from '../Register';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));


global.alert = jest.fn();

describe('Register component', () => {
  beforeEach(() => {
    fetch.resetMocks && fetch.resetMocks(); // dacă folosești jest-fetch-mock
    jest.clearAllMocks();
  });

  const setup = () =>
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

  it('renderizează formularul corect', () => {
    setup();

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/parolă/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('trimite datele și redirecționează la login dacă răspunsul e OK', async () => {
    setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      })
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/parolă/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/auth/register', expect.any(Object));
      expect(global.alert).toHaveBeenCalledWith('Înregistrare reușită!');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('afișează alertă de eroare dacă fetch eșuează', async () => {
    setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email deja folosit' }),
      })
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/parolă/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Email deja folosit');
    });
  });
});
