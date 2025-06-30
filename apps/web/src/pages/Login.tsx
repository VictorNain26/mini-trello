import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPwd]      = useState('');
  const [csrf, setCsrf]         = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const nav  = useNavigate();
  const loc  = useLocation();
  const from = (loc.state as any)?.from?.pathname || '/';     // ex : “/” ou “/board/123”

  /* -- récupère le token CSRF + cookie -- */
  useEffect(() => {
    fetch('http://localhost:4000/auth/csrf', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setCsrf(j.csrfToken))
      .catch(() => setError('Erreur CSRF'));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrf) return;

    setLoading(true);
    setError(null);

    const body = new URLSearchParams({
      email,
      password,
      csrfToken: csrf,
      /* --- URL ABSOLUE vers le front (5173) --- */
      callbackUrl: `${window.location.origin}${from}`,
      json: 'true',                         // réponse JSON, pas de redirection 302
    });

    const res = await fetch('http://localhost:4000/auth/callback/credentials', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    setLoading(false);

    if (res.ok) {
      /* succès : on reste sur le même origin, on navigue simplement vers “from” */
      return nav(from, { replace: true });
    }

    setError('Email ou mot de passe incorrect');
  };

  return (
    <div className="min-h-screen grid place-content-center bg-neutral-50">
      <form onSubmit={submit} className="grid gap-4 bg-white p-8 rounded-xl shadow w-80">
        <h2 className="text-lg font-semibold text-center">Connexion</h2>

        <input type="email" required value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="email@example.com" className="border p-2 rounded" />

        <input type="password" required value={password}
               onChange={(e) => setPwd(e.target.value)}
               placeholder="mot de passe" className="border p-2 rounded" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={loading || !csrf}
                className="bg-black text-white p-2 rounded disabled:opacity-50">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="text-xs text-center">
          Pas encore inscrit ? <a href="/signup" className="underline">Créer un compte</a>
        </p>
      </form>
    </div>
  );
}
