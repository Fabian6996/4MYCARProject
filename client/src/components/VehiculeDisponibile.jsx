import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VehiculeDisponibile() {
  const [vehicule, setVehicule] = useState([]);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nr_inmatriculare: '',
    asigurare_exp: '',
    itp_exp: '',
    rovinieta_exp: '',
  });


  const [historyFor, setHistoryFor] = useState(null);
  const [historyData, setHistoryData] = useState([]);


  const zileRamase = (dataExpirare) => {
    if (!dataExpirare) return null;
    const azi = new Date();
    const expirare = new Date(dataExpirare);
    const diffTime = expirare - azi; 
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  
  const culoareExpirare = (zile) => {
    if (zile === null) return {};
    if (zile <= 1) return { color: 'red', fontWeight: 'bold' };
    if (zile <= 3) return { color: 'orange', fontWeight: 'bold' };
    if (zile <= 7) return { color: 'yellow', fontWeight: 'bold' };
    return {};
  };

  const fetchVehicule = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/vehicule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicule(res.data);
    } catch (err) {
      console.error('Eroare la încărcare vehicule:', err);
    }
  };

  useEffect(() => {
    fetchVehicule();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (vehiculId) => {
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('poza', file);

    try {
      await axios.post(`http://localhost:5000/vehicule/${vehiculId}/poza`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Poză încărcată cu succes!');
      setFile(null);
      setUploadingFor(null);
      fetchVehicule();
    } catch (error) {
      console.error('Eroare la încărcare poza:', error);
      setMessage('Eroare la încărcare poza.');
    }
  };

  const handleDeletePhoto = async (vehiculId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi poza?')) return;
    const token = localStorage.getItem('token');

    try {
      const res = await axios.delete(`http://localhost:5000/vehicule/${vehiculId}/poza`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.message || 'Poză ștearsă cu succes!');
      setVehicule((prev) =>
        prev.map((v) => (v.id === vehiculId ? { ...v, poza: null } : v))
      );
    } catch (error) {
      console.error('Eroare la ștergerea pozei:', error);
      alert('Eroare la ștergerea pozei.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest vehicul?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/vehicule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Vehicul șters cu succes!');
      fetchVehicule();
    } catch (err) {
      console.error('Eroare la ștergere:', err);
      alert('Eroare la ștergere vehicul.');
    }
  };


  const startEditing = (vehicul) => {
    setEditingId(vehicul.id);
    setEditForm({
      nr_inmatriculare: vehicul.nr_inmatriculare || '',
      asigurare_exp: vehicul.asigurare_exp?.slice(0, 10) || '',
      itp_exp: vehicul.itp_exp?.slice(0, 10) || '',
      rovinieta_exp: vehicul.rovinieta_exp?.slice(0, 10) || '',
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = async () => {
    const token = localStorage.getItem('token');

    if (
      !editForm.nr_inmatriculare ||
      !editForm.asigurare_exp ||
      !editForm.itp_exp ||
      !editForm.rovinieta_exp
    ) {
      alert('Toate câmpurile sunt obligatorii.');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/vehicule/${editingId}`,
        {
          nr_inmatriculare: editForm.nr_inmatriculare,
          asigurare_exp: editForm.asigurare_exp,
          itp_exp: editForm.itp_exp,
          rovinieta_exp: editForm.rovinieta_exp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Vehicul actualizat cu succes!');
      setEditingId(null);
      fetchVehicule();
    } catch (err) {
      console.error('Eroare la actualizare:', err);
      alert('Eroare la actualizare vehicul.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };


  const fetchHistory = async (vehiculId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(
        `http://localhost:5000/vehicule/${vehiculId}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistoryData(res.data);
      setHistoryFor(vehiculId);
    } catch (error) {
      console.error('Eroare la încărcare istoric:', error);
      alert('Eroare la încărcare istoric.');
    }
  };

  return (
    <div>
      <h2>Vehicule Disponibile</h2>

      {vehicule.length === 0 && <p>Nu ai niciun vehicul adăugat.</p>}

      {vehicule.map((v) => (
        <div
          key={v.id}
          style={{
            marginBottom: '15px',
            borderBottom: '1px solid #ccc',
            paddingBottom: '10px',
          }}
        >
          {editingId === v.id ? (
            <>
              <h3>Editează vehicul</h3>
              <label>
                Nr. Înmatriculare:
                <input
                  name="nr_inmatriculare"
                  value={editForm.nr_inmatriculare}
                  onChange={handleEditChange}
                />
              </label>
              <br />
              <label>
                Asigurare expiră:
                <input
                  type="date"
                  name="asigurare_exp"
                  value={editForm.asigurare_exp}
                  onChange={handleEditChange}
                />
              </label>
              <br />
              <label>
                ITP expiră:
                <input
                  type="date"
                  name="itp_exp"
                  value={editForm.itp_exp}
                  onChange={handleEditChange}
                />
              </label>
              <br />
              <label>
                Rovinietă expiră:
                <input
                  type="date"
                  name="rovinieta_exp"
                  value={editForm.rovinieta_exp}
                  onChange={handleEditChange}
                />
              </label>
              <br />
              <button onClick={saveEdit}>Salvează</button>
              <button onClick={cancelEdit} style={{ marginLeft: '10px' }}>
                Anulează
              </button>
            </>
          ) : (
            <>
              <strong>{v.nr_inmatriculare}</strong>
<br />

<div>
  Asigurare expiră: {v.asigurare_exp?.slice(0, 10)}{' '}
  {(() => {
    const zile = zileRamase(v.asigurare_exp?.slice(0, 10));
    if (zile === null) return null;

    if (zile < 0) {
      return (
        <span style={{ marginLeft: '10px', color: 'red', fontWeight: 'bold' }}>
          A trecut termenul de expirare!
        </span>
      );
    }

    if (zile <= 7) {
      return (
        <span style={{ marginLeft: '10px', color: 'red', fontWeight: 'bold' }}>
          Atenție! Mai sunt {zile} {zile === 1 ? 'zi' : 'zile'}
        </span>
      );
    }
    return null;
  })()}
</div>

<div>
  ITP expiră: {v.itp_exp?.slice(0, 10)}{' '}
  {(() => {
    const zile = zileRamase(v.itp_exp?.slice(0, 10));
    if (zile === null) return null;

    if (zile < 0) {
      return (
        <span style={{ marginLeft: '10px', color: 'red', fontWeight: 'bold' }}>
          A trecut termenul de expirare!
        </span>
      );
    }

    if (zile <= 7) {
      return (
        <span style={{ marginLeft: '10px', color: 'red', fontWeight: 'bold' }}>
          Atenție! Mai sunt {zile} {zile === 1 ? 'zi' : 'zile'}
        </span>
      );
    }
    return null;
  })()}
</div>

<div>
  Rovinieta expiră: {v.rovinieta_exp?.slice(0, 10)}{' '}
  {(() => {
    const zile = zileRamase(v.rovinieta_exp?.slice(0, 10));
    if (zile === null) return null;

    if (zile < 0) {
      return (
        <span style={{ marginLeft: '10px', color: 'red', fontWeight: 'bold' }}>
          A trecut termenul de expirare!
        </span>
      );
    }

    if (zile <= 7) {
      return (
        <span style={{ marginLeft: '10px', color: 'red', fontWeight: 'bold' }}>
          Atenție! Mai sunt {zile} {zile === 1 ? 'zi' : 'zile'}
        </span>
      );
    }
    return null;
  })()}
</div>


                {v.poza && (
                <>
                  <img
                    src={`http://localhost:5000/uploads/${v.poza}`}
                    alt="Poză vehicul"
                    style={{ width: '750px', marginTop: '10px', borderRadius: '5px' }}
                  />
                  <button
                    onClick={() => handleDeletePhoto(v.id)}
                    style={{ display: 'block', marginTop: '10px' }}
                  >
                    Șterge poză
                  </button>
                </>
              )}

              {uploadingFor === v.id ? (
                <>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ marginTop: '10px' }}
                  />
                  <button
                    onClick={() => handleUpload(v.id)}
                    disabled={!file}
                    style={{ marginLeft: '10px' }}
                  >
                    Încarcă poza
                  </button>
                  <button
                    onClick={() => {
                      setUploadingFor(null);
                      setFile(null);
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Anulează
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setUploadingFor(v.id)}
                  style={{ marginTop: '10px' }}
                >
                  Încarcă poză
                </button>
              )}

              <button
                onClick={() => startEditing(v)}
                style={{ marginLeft: '10px', marginTop: '10px' }}
              >
                Editează
              </button>

              <button
                onClick={() => handleDelete(v.id)}
                style={{ marginLeft: '10px', marginTop: '10px' }}
              >
                Șterge vehicul
              </button>

              <button
                onClick={() => {
                  if (historyFor === v.id) {
                    setHistoryFor(null);
                  } else {
                    fetchHistory(v.id);
                  }
                }}
                style={{ marginLeft: '10px', marginTop: '10px' }}
              >
                Istoric modificări
              </button>

              {historyFor === v.id && (
  <div className="history-container">
    <h4>Istoric modificări</h4>
    {historyData.length === 0 ? (
      <p>Nu există modificări înregistrate.</p>
    ) : (
      <table className="history-table" border="1" cellPadding="5">
                      <thead>
                        <tr>
                          <th>Nr. Înmatriculare</th>
                          <th>Asigurare expiră</th>
                          <th>ITP expiră</th>
                          <th>Rovinieta expiră</th>
                          <th>Modificat la</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.map((h, idx) => (
                          <tr key={idx}>
                            <td>{h.nr_inmatriculare}</td>
                            <td>{h.asigurare_exp?.slice(0, 10)}</td>
                            <td>{h.itp_exp?.slice(0, 10)}</td>
                            <td>{h.rovinieta_exp?.slice(0, 10)}</td>
                            <td>
                              {(() => {
                                try {
                                  return h.modified_at.replace('.000Z', '');
                                } catch {
                                  return h.modified_at;
                                }
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {message && <p>{message}</p>}
    </div>
  );
}

export default VehiculeDisponibile;
