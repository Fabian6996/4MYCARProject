import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddVehicul from '../AddVehicul'; // ajustează calea dacă e în alt folder
import '@testing-library/jest-dom';


describe('AddVehicul component', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = jest.fn();

    // Mock localStorage.getItem (token)
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renderizează corect formularul', () => {
    render(<AddVehicul />);

    expect(screen.getByPlaceholderText(/număr înmatriculare/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adaugă/i })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(1); // doar nr_inmatriculare e text
  });

  test('simulează completarea și submitul formularului cu succes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Vehicul salvat cu succes!' }),
    });

    const onSaveSuccess = jest.fn();

    render(<AddVehicul onSaveSuccess={onSaveSuccess} />);

    fireEvent.change(screen.getByPlaceholderText(/număr înmatriculare/i), {
      target: { value: 'B123XYZ' },
    });

    const dateInputs = screen.getAllByDisplayValue('');

    fireEvent.change(dateInputs[0], { target: { value: '2025-12-31' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-11-30' } });
    fireEvent.change(dateInputs[2], { target: { value: '2025-10-31' } });

    fireEvent.click(screen.getByRole('button', { name: /adaugă/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });

  test('ar trebui să afișeze eroare la fetch eșuat', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Eroare server.' }),
    });

    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AddVehicul />);

    fireEvent.change(screen.getByPlaceholderText(/număr înmatriculare/i), {
      target: { value: 'B123XYZ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /adaugă/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Eroare'));
    });

    window.alert.mockRestore();
  });
});
