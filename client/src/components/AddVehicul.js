import React, { useState, useEffect } from 'react';

const AddVehicul = ({ vehiculSelectat, onSaveSuccess }) => {
  const [nr_inmatriculare, setNr] = useState('');
  const [asigurare_exp, setAsigurare] = useState('');
  const [itp_exp, setItp] = useState('');
  const [rovinieta_exp, setRovinieta] = useState('');
  const [vehiculId, setVehiculId] = useState(null);

  useEffect(() => {
    if (vehiculSelectat) {
      setNr(vehiculSelectat.nr_inmatriculare || '');

      
      setAsigurare(vehiculSelectat.asigurare_exp ? vehiculSelectat.asigurare_exp.slice(0, 10) : '');
      setItp(vehiculSelectat.itp_exp ? vehiculSelectat.itp_exp.slice(0, 10) : '');
      setRovinieta(vehiculSelectat.rovinieta_exp ? vehiculSelectat.rovinieta_exp.slice(0, 10) : '');

      setVehiculId(vehiculSelectat.id || null);
    } else {
      
      setNr('');
      setAsigurare('');
      setItp('');
      setRovinieta('');
      setVehiculId(null);
    }
  }, [vehiculSelectat]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    
    const vehiculData = {
      nr_inmatriculare,
      asigurare_exp,
      itp_exp,
      rovinieta_exp,
    };

    try {
      const url = vehiculId
        ? `http://localhost:5000/vehicule/${vehiculId}`
        : 'http://localhost:5000/vehicule';

      const method = vehiculId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehiculData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert(data.message);

      
      setNr('');
      setAsigurare('');
      setItp('');
      setRovinieta('');
      setVehiculId(null);

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert('Eroare: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{vehiculId ? 'Editează vehicul' : 'Adaugă vehicul'}</h2>

      <input
        type="text"
        placeholder="Număr înmatriculare"
        value={nr_inmatriculare}
        onChange={(e) => setNr(e.target.value)}
        required
      />

<label>
  Data expirare asigurare:
  <input
    type="date"
    value={asigurare_exp}
    onChange={(e) => setAsigurare(e.target.value)}
    required
  />
</label>

<label>
  Data expirare ITP:
  <input
    type="date"
    value={itp_exp}
    onChange={(e) => setItp(e.target.value)}
    required
  />
</label>

<label>
  Data expirare rovinietă:
  <input
    type="date"
    value={rovinieta_exp}
    onChange={(e) => setRovinieta(e.target.value)}
    required
  />
</label>

      

      <button type="submit">{vehiculId ? 'Actualizează' : 'Adaugă'}</button>
    </form>
  );
};

export default AddVehicul;
