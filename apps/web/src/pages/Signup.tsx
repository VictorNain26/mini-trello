import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPwd]    = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    setLoading(false);
    if (res.status === 201) {
      navigate('/login');
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? 'Erreur serveur');
    }
  };

  return (
    <div className="min-h-screen grid place-content-center bg-neutral-50">
      <form
        onSubmit={submit}
        className="grid gap-4 bg-white p-8 rounded-xl shadow w-96"
      >
        <h2 className="text-lg font-semibold text-center">Créer un compte</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom (optionnel)"
          className="border p-2 rounded"
        />

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="border p-2 rounded"
        />

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="mot de passe"
          className="border p-2 rounded"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Création…' : 'Créer le compte'}
        </button>

        <p className="text-xs text-center">
          Déjà inscrit ?{' '}
          <a href="/login" className="underline">
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}
