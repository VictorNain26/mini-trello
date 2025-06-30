import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [csrf, setCsrf]           = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  // Récupérer token CSRF
  useEffect(() => {
    fetch('http://localhost:4000/auth/csrf', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setCsrf(data.csrfToken))
      .catch(() => setError('Impossible de récupérer le token CSRF'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrf) return;

    setLoading(true);
    setError(null);

    const body = new URLSearchParams({
      email,
      password,
      csrfToken: csrf,
      callbackUrl: `${window.location.origin}${from}`,
      json: 'true',
    });

    try {
      const res = await fetch('http://localhost:4000/auth/callback/credentials', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        redirect: 'manual',
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setError('Échec de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Connexion</h2>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
          className="w-full border px-3 py-2 rounded"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !csrf}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="text-center text-sm">
          Pas encore inscrit ?{' '}
          <a href="/signup" className="underline text-blue-600">Créer un compte</a>
        </p>
      </form>
    </div>
  );
}
