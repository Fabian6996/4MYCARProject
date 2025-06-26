import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehiculeDisponibile from '../../components/VehiculeDisponibile';
import axios from 'axios';

jest.mock('axios');

const originalConfirm = window.confirm;

beforeEach(() => {
  localStorage.setItem('token', 'fake-token');
  window.confirm = jest.fn(() => true);
});

afterEach(() => {
  window.confirm = originalConfirm;
});

test('permite salvarea modificarii unui vehicul', async () => {
  axios.get.mockResolvedValueOnce({
    data: [{
      id: 1,
      nr_inmatriculare: 'B123ABC',
      asigurare_exp: '2025-12-31',
      itp_exp: '2025-12-31',
      rovinieta_exp: '2025-12-31',
    }],
  });

  axios.put.mockResolvedValueOnce({});

  render(<VehiculeDisponibile />);

  const editButton = await screen.findByText('Editează');
  fireEvent.click(editButton);

  const input = screen.getByLabelText(/Nr. Înmatriculare/i);
  fireEvent.change(input, { target: { value: 'B999ZZZ' } });

  const saveButton = screen.getByText('Salvează');
  fireEvent.click(saveButton);

  await waitFor(() =>
    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:5000/vehicule/1',
      expect.objectContaining({ nr_inmatriculare: 'B999ZZZ' }),
      expect.any(Object)
    )
  );

  // Opțional: verifică că noua valoare este afișată în UI
  expect(screen.getByText('B999ZZZ')).toBeInTheDocument();
});

test('permite stergerea unui vehicul', async () => {
  axios.get.mockResolvedValueOnce({
    data: [{
      id: 2,
      nr_inmatriculare: 'B456DEF',
      asigurare_exp: '2025-12-31',
      itp_exp: '2025-12-31',
      rovinieta_exp: '2025-12-31',
    }],
  });

  axios.delete.mockResolvedValueOnce({});

  render(<VehiculeDisponibile />);

  const deleteButton = await screen.findByText('Șterge vehicul');
  fireEvent.click(deleteButton);

  await waitFor(() =>
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:5000/vehicule/2',
      expect.any(Object)
    )
  );
});

test('permite incarcarea unei poze', async () => {
  const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

  axios.get.mockResolvedValueOnce({
    data: [{
      id: 3,
      nr_inmatriculare: 'B789GHI',
      asigurare_exp: '2025-12-31',
      itp_exp: '2025-12-31',
      rovinieta_exp: '2025-12-31',
    }],
  });

  axios.post.mockResolvedValueOnce({});

  render(<VehiculeDisponibile />);
  const uploadPhotoButton = await screen.findByText('Încarcă poză');
  fireEvent.click(uploadPhotoButton);

  // Înlocuiește selectorul cu unul potrivit dacă ai posibilitatea în componentă
  const fileInput = screen.getByLabelText(/Alege fișier/i);
  fireEvent.change(fileInput, { target: { files: [mockFile] } });

  const confirmUploadButton = screen.getByText('Încarcă poza');
  fireEvent.click(confirmUploadButton);

  await waitFor(() =>
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/vehicule/3/poza'),
      expect.any(FormData),
      expect.any(Object)
    )
  );
});

test('permite stergerea pozei unui vehicul', async () => {
  axios.get.mockResolvedValueOnce({
    data: [{
      id: 4,
      nr_inmatriculare: 'B000XYZ',
      poza: 'test.jpg',
      asigurare_exp: '2025-12-31',
      itp_exp: '2025-12-31',
      rovinieta_exp: '2025-12-31',
    }],
  });

  axios.delete.mockResolvedValueOnce({ data: { message: 'Poza ștearsă' } });

  render(<VehiculeDisponibile />);
  const deletePhotoButton = await screen.findByText('Șterge poză');
  fireEvent.click(deletePhotoButton);

  await waitFor(() =>
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:5000/vehicule/4/poza',
      expect.any(Object)
    )
  );
});

test('permite afisarea istoricului modificarilor', async () => {
  axios.get
    .mockResolvedValueOnce({
      data: [{
        id: 5,
        nr_inmatriculare: 'BISTORIC',
        asigurare_exp: '2025-12-31',
        itp_exp: '2025-12-31',
        rovinieta_exp: '2025-12-31',
      }],
    })
    .mockResolvedValueOnce({
      data: [{
        nr_inmatriculare: 'BISTORIC',
        asigurare_exp: '2024-01-01',
        itp_exp: '2024-01-01',
        rovinieta_exp: '2024-01-01',
        modified_at: '2024-06-01T12:00:00.000Z',
      }],
    });

  render(<VehiculeDisponibile />);
  const historyButton = await screen.findByText('Istoric modificări');
  fireEvent.click(historyButton);

  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:5000/vehicule/5/history',
      expect.any(Object)
    )
  );

  expect(await screen.findByText('2024-01-01')).toBeInTheDocument();
});
