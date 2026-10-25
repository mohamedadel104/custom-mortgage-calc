import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Calculator,
  Github,
  GitCompareArrows,
  House,
  MapPin,
  Menu,
  ShieldCheck,
  TrendingUp,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import InputsPanel from './components/InputsPanel';
import PlanResults from './components/PlanResults';
import Compare, { type SavedPlan } from './pages/Compare';
import Guide from './pages/Guide';
import Market from './pages/Market';
import Location from './pages/Location';
import RentBuy from './pages/RentBuy';
import { calculate, DEFAULTS, sanitizeInputs, type Inputs } from './lib/mortgage';
import { validSnapshot, type RateSnapshot } from './lib/rates';
import { useDataset } from './lib/useDataset';
import { REPO, readLocal, writeLocal } from './lib/storage';

const NAV = [
  { id: 'calculator', label: 'Mortgage calculator', icon: Calculator },
  { id: 'location', label: 'Location intelligence', icon: MapPin },
  { id: 'compare', label: 'Compare scenarios', icon: GitCompareArrows },
  { id: 'rent', label: 'Rent vs. buy', icon: ArrowLeftRight },
  { id: 'market', label: 'Market & sources', icon: TrendingUp },
  { id: 'guide', label: 'The mortgage guide', icon: BookOpen },
] as const;
type Page = (typeof NAV)[number]['id'];

export default function App() {
  const initialHash = location.hash.slice(1);
  const [page, setPage] = useState<Page>(
    NAV.some((n) => n.id === initialHash) ? (initialHash as Page) : 'calculator',
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inputs, setInputs] = useState<Inputs>(() =>
    sanitizeInputs(readLocal('zuhause-draft', DEFAULTS)),
  );
  const [plans, setPlans] = useState<SavedPlan[]>(() => {
    const raw = readLocal<unknown>('zuhause-plans', []);
    return Array.isArray(raw)
      ? raw
          .filter(
            (p) =>
              p &&
              typeof p.id === 'string' &&
              typeof p.name === 'string' &&
              Number.isFinite(Date.parse(p.savedAt)),
          )
          .slice(0, 3)
          .map((p) => ({ ...p, name: p.name.slice(0, 50), inputs: sanitizeInputs(p.inputs) }))
      : [];
  });
  const [toast, setToast] = useState('');
  const [storageIssue, setStorageIssue] = useState(false);
  const rates = useDataset<RateSnapshot>('data/rates.json', validSnapshot);
  const result = useMemo(() => calculate(inputs), [inputs]);
  const navigate = (value: Page) => {
    setPage(value);
    setMobileOpen(false);
    location.hash = value;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    const onHash = () => {
      const id = location.hash.slice(1);
      if (NAV.some((n) => n.id === id)) setPage(id as Page);
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    setStorageIssue(!writeLocal('zuhause-draft', inputs));
  }, [inputs]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const update = (patch: Partial<Inputs>) =>
    setInputs((prev) => sanitizeInputs({ ...prev, ...patch }));
  const changePlans = (next: SavedPlan[]) => {
    setPlans(next);
    if (!writeLocal('zuhause-plans', next))
      setToast('Storage is unavailable. Export your scenarios to keep a backup.');
  };
  const save = () => {
    if (plans.length >= 3) {
      setToast('Your three comparison slots are full. Remove a plan to save another.');
      navigate('compare');
      return;
    }
    changePlans([
      ...plans,
      {
        id: crypto.randomUUID(),
        name: `My plan ${plans.length + 1}`,
        inputs: { ...inputs },
        savedAt: new Date().toISOString(),
      },
    ]);
    setToast('Scenario saved. Change your assumptions to compare another plan.');
    navigate('compare');
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <a
            href="#calculator"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              navigate('calculator');
            }}
          >
            <House size={21} strokeWidth={1.5} />
            <span>zuhause</span>
          </a>
          <nav className={mobileOpen ? 'mobile-open' : ''} aria-label="Main navigation">
            {NAV.map((item) => (
              <button
                key={item.id}
                className={page === item.id ? 'active' : ''}
                aria-current={page === item.id ? 'page' : undefined}
                onClick={() => navigate(item.id)}
              >
                {
                  {
                    calculator: 'Calculator',
                    location: 'Locations',
                    compare: 'Compare',
                    rent: 'Rent vs. buy',
                    market: 'Market data',
                    guide: 'Guide',
                  }[item.id]
                }
              </button>
            ))}
          </nav>
          <a
            className="github-header icon-button"
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="View open-source GitHub project"
          >
            <Github size={18} />
          </a>
          <button
            className="mobile-toggle icon-button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      <div className="main-shell">
        <main id="main">
          <div className="content-container">
            {storageIssue && (
              <div className="notice warning" role="status">
                Browser storage is unavailable. Your draft lasts for this visit only; export
                scenarios and evidence to keep a backup.
              </div>
            )}
            {page === 'calculator' && (
              <>
                <section className="planner-title">
                  <div>
                    <h1>German mortgage planner</h1>
                    <p>{result.state.name} · Owner-occupied home · All amounts in euros</p>
                  </div>
                  <div className="title-actions">
                    <button className="text-button" onClick={() => navigate('guide')}>
                      <BookOpen size={15} />
                      First time buying? Read the guide
                    </button>
                    <span className="private-label">
                      <ShieldCheck size={14} />
                      Saved on this device
                    </span>
                  </div>
                </section>
                <div className="calculator-layout">
                  <InputsPanel
                    inputs={inputs}
                    update={update}
                    onReset={() => {
                      setInputs({ ...DEFAULTS });
                      setToast('Calculator reset to the illustrative Bavaria example.');
                    }}
                  />
                  <PlanResults result={result} onSave={save} />
                </div>
                <section className="next-step-banner">
                  <div>
                    <h2>Is the asking price supported by local evidence?</h2>
                    <p>Explore Bavarian reports, reference values and historical price context.</p>
                  </div>
                  <button className="secondary-button" onClick={() => navigate('location')}>
                    Research a location <ArrowUpRight size={16} />
                  </button>
                </section>
              </>
            )}
            {page === 'location' && (
              <Location
                inputs={inputs}
                update={update}
                goCalculator={() => navigate('calculator')}
              />
            )}
            {page === 'compare' && (
              <Compare
                plans={plans}
                save={save}
                onChange={changePlans}
                load={(p) => {
                  setInputs(sanitizeInputs(p));
                  navigate('calculator');
                  setToast('Saved scenario loaded into the calculator.');
                }}
                message={setToast}
              />
            )}
            {page === 'rent' && <RentBuy inputs={inputs} />}
            {page === 'market' && (
              <Market
                rates={rates.data}
                error={rates.error}
                reload={rates.reload}
                update={update}
                goCalculator={() => navigate('calculator')}
              />
            )}
            {page === 'guide' && <Guide />}
            <footer className="footer">
              <a href={REPO} target="_blank" rel="noreferrer">
                <House size={15} />
                zuhause <span>Open calculations. Informed decisions.</span>
              </a>
              <span>
                Planning estimates ·{' '}
                <button onClick={() => navigate('market')}>Sources & methodology</button>
              </span>
            </footer>
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <ShieldCheck size={18} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
