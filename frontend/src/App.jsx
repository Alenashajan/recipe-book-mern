import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, ChefHat, Clock3, Plus, Search, X, Pencil, Trash2, ArrowLeft, Leaf, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Other'];
const emptyForm = { name: '', category: 'Breakfast', ingredients: '', steps: '', cookingTime: '20' };

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
  } catch {
    throw new Error('Cannot reach the backend. Check that the server is running and the API URL is correct.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`} role="status">
    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    <span>{toast.message}</span><button className="icon-button" onClick={onClose} aria-label="Dismiss"><X size={16} /></button>
  </div>;
}

function RecipeForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState('');

  useEffect(() => { setForm(initial || emptyForm); setError(''); }, [initial]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const ingredients = form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean);
    const steps = form.steps.split('\n').map((s) => s.trim()).filter(Boolean);
    const time = Number(form.cookingTime);
    if (!form.name.trim()) return setError('Please enter a recipe name.');
    if (!ingredients.length) return setError('Add at least one ingredient.');
    if (!steps.length) return setError('Add at least one preparation step.');
    if (!Number.isInteger(time) || time < 1 || time > 1440) return setError('Cooking time must be a whole number from 1 to 1440.');
    try {
      await onSave({ name: form.name.trim(), category: form.category, ingredients, steps, cookingTime: time });
    } catch (err) { setError(err.message); }
  }

  return <form className="recipe-form" onSubmit={submit}>
    <div className="form-heading">
      <div><span className="eyebrow">{initial?._id ? 'YOUR COLLECTION' : 'ADD TO YOUR COLLECTION'}</span><h2>{initial?._id ? 'Edit recipe' : 'A new favourite'}</h2></div>
      <button type="button" className="icon-button close-button" onClick={onCancel} aria-label="Close form"><X /></button>
    </div>
    <label>Recipe name<input name="name" value={form.name} onChange={update} placeholder="e.g. Creamy tomato pasta" maxLength="100" required /></label>
    <div className="field-row">
      <label>Category<select name="category" value={form.category} onChange={update}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>Cooking time (minutes)<input name="cookingTime" type="number" min="1" max="1440" step="1" value={form.cookingTime} onChange={update} required /></label>
    </div>
    <label>Ingredients <span className="label-note">One ingredient per line</span><textarea name="ingredients" value={form.ingredients} onChange={update} placeholder={'2 cups pasta\n1 cup tomato sauce\n1 tbsp olive oil'} rows="5" required /></label>
    <label>Preparation steps <span className="label-note">One step per line</span><textarea name="steps" value={form.steps} onChange={update} placeholder={'Boil the pasta until tender.\nWarm the sauce in a pan.\nMix together and serve.'} rows="5" required /></label>
    {error && <p className="form-error"><AlertCircle size={16} />{error}</p>}
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : initial?._id ? 'Save changes' : 'Save recipe'}</button></div>
  </form>;
}

function RecipeDetails({ recipe, onClose, onEdit, onDelete }) {
  if (!recipe) return null;
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="details-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="detail-top"><span className="eyebrow">FROM YOUR RECIPE BOX</span><button className="icon-button" onClick={onClose} aria-label="Close details"><X /></button></div>
      <div className="detail-illustration"><span className="food-orbit orbit-one">✳</span><ChefHat size={54} strokeWidth={1.3}/><span className="food-orbit orbit-two">✦</span></div>
      <span className="category-pill">{recipe.category}</span>
      <h2 id="detail-title" className="detail-title">{recipe.name}</h2>
      <div className="detail-time"><Clock3 size={17}/>{recipe.cookingTime} minutes</div>
      <div className="detail-section"><h3><span>01</span> Ingredients</h3><ul className="ingredient-list">{recipe.ingredients.map((item, i) => <li key={`${item}-${i}`}><span className="ingredient-dot"/>{item}</li>)}</ul></div>
      <div className="detail-section"><h3><span>02</span> Preparation</h3><ol className="step-list">{recipe.steps.map((item, i) => <li key={`${item}-${i}`}><span className="step-number">{i+1}</span><p>{item}</p></li>)}</ol></div>
      <div className="detail-actions"><button className="button secondary" onClick={() => onEdit(recipe)}><Pencil size={16}/> Edit recipe</button><button className="button danger-outline" onClick={() => onDelete(recipe)}><Trash2 size={16}/> Delete</button></div>
    </section>
  </div>;
}

function RecipeCard({ recipe, onOpen, onEdit, onDelete }) {
  const palette = { Breakfast: 'peach', Lunch: 'green', Dinner: 'lavender', Snack: 'yellow', Dessert: 'pink', Other: 'blue' };
  return <article className="recipe-card">
    <button className={`card-art ${palette[recipe.category] || 'green'}`} onClick={() => onOpen(recipe)} aria-label={`View ${recipe.name}`}>
      <span className="art-spark spark-a">✳</span><span className="art-circle"><Utensils size={30} strokeWidth={1.3}/></span><span className="art-spark spark-b">✦</span>
      <span className="art-category">{recipe.category}</span>
    </button>
    <div className="card-content">
      <button className="card-title-button" onClick={() => onOpen(recipe)}><h3>{recipe.name}</h3></button>
      <div className="card-meta"><span><Clock3 size={15}/>{recipe.cookingTime} min</span><span><Leaf size={15}/>{recipe.ingredients.length} ingredients</span></div>
      <div className="card-bottom"><button className="text-action" onClick={() => onOpen(recipe)}>View recipe <span>↗</span></button><div className="card-tools"><button className="icon-button" onClick={() => onEdit(recipe)} aria-label={`Edit ${recipe.name}`}><Pencil size={16}/></button><button className="icon-button delete-icon" onClick={() => onDelete(recipe)} aria-label={`Delete ${recipe.name}`}><Trash2 size={16}/></button></div></div>
    </div>
  </article>;
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [toast, setToast] = useState(null);
  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All recipes');

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try { setRecipes(await api('/recipes')); }
    catch (err) { setFetchError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesSearch = `${recipe.name} ${recipe.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'All recipes' || recipe.category === filter);
  }), [recipes, search, filter]);

  function openAdd() { setSelected(null); setEditing(null); setMode('form'); }
  function openEdit(recipe) {
    setSelected(null);
    setEditing({ ...recipe, ingredients: recipe.ingredients.join('\n'), steps: recipe.steps.join('\n'), cookingTime: String(recipe.cookingTime) });
    setMode('form');
  }
  async function saveRecipe(data) {
    setSaving(true);
    try {
      const result = editing?._id
        ? await api(`/recipes/${editing._id}`, { method: 'PUT', body: JSON.stringify(data) })
        : await api('/recipes', { method: 'POST', body: JSON.stringify(data) });
      setToast({ type: 'success', message: result.message });
      setMode('list'); setEditing(null); setSelected(null);
      await loadRecipes();
    } finally { setSaving(false); }
  }
  async function deleteRecipe(recipe) {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;
    try {
      const result = await api(`/recipes/${recipe._id}`, { method: 'DELETE' });
      setRecipes((current) => current.filter((item) => item._id !== recipe._id));
      setSelected(null);
      setToast({ type: 'success', message: result.message });
    } catch (err) { setToast({ type: 'error', message: err.message }); }
  }

  return <div className="app-shell">
    <header className="topbar"><a href="#" className="brand" onClick={(e) => { e.preventDefault(); setMode('list'); setSelected(null); }}><span className="brand-mark"><ChefHat size={23}/></span><span>gather<span className="brand-dot">.</span><small>YOUR PERSONAL RECIPE BOOK</small></span></a><div className="topbar-right"><span className="saved-count"><BookOpen size={16}/>{recipes.length} saved {recipes.length === 1 ? 'recipe' : 'recipes'}</span><button className="button primary add-top" onClick={openAdd}><Plus size={17}/> Add recipe</button></div></header>
    <main>
      <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-line"/> A LITTLE LOVE, SERVED DAILY</span><h1>Your kitchen.<br/><em>Your kind of magic.</em></h1><p>Keep the recipes you love, all in one lovely place.<br className="desktop-break"/> A collection made for your next craving.</p><button className="button primary hero-button" onClick={openAdd}><Plus size={18}/> Add your first recipe</button></div><div className="hero-art" aria-hidden="true"><div className="hero-blob"/><div className="hero-plate"><div className="plate-inner"><span className="plate-leaf leaf-one">❧</span><span className="plate-pasta">〰</span><span className="plate-herb">✳</span><span className="plate-leaf leaf-two">❧</span></div></div><div className="floating-note note-top"><span>✳</span> made with love</div><div className="floating-note note-bottom"><span>♡</span> a pinch of joy</div><div className="hero-star star-one">✦</div><div className="hero-star star-two">✳</div></div></section>
      <section className="collection-section"><div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Your recipe collection <span className="heading-count">{recipes.length.toString().padStart(2, '0')}</span></h2></div><div className="collection-controls"><label className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a recipe..." aria-label="Search recipes"/></label><select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category"><option>All recipes</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div></div>
        {mode === 'form' && <div className="form-wrap"><RecipeForm key={editing?._id || 'new'} initial={editing} onCancel={() => { setMode('list'); setEditing(null); }} onSave={saveRecipe} saving={saving}/></div>}
        {fetchError && <div className="error-banner"><AlertCircle/><div><strong>We couldn't load your recipes.</strong><p>{fetchError}</p><button className="text-action" onClick={loadRecipes}>Try again ↻</button></div></div>}
        {loading ? <div className="loading-state"><div className="loader"/><p>Setting the table…</p></div> : !fetchError && filteredRecipes.length === 0 ? <div className="empty-state"><div className="empty-icon"><ChefHat size={35}/></div><h3>{recipes.length === 0 ? 'Your recipe book is waiting.' : 'No recipes found.'}</h3><p>{recipes.length === 0 ? 'Add a favourite dish and start building your collection.' : 'Try another search or category.'}</p>{recipes.length === 0 && <button className="button primary" onClick={openAdd}><Plus size={17}/> Add a recipe</button>}</div> : !fetchError && <div className="recipe-grid">{filteredRecipes.map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} onOpen={setSelected} onEdit={openEdit} onDelete={deleteRecipe}/>)}</div>}
      </section>
      <footer className="footer"><span><ChefHat size={17}/> gather<span className="brand-dot">.</span></span><span>Collected with care, cooked with love.</span><span>YOUR RECIPE BOOK · {new Date().getFullYear()}</span></footer>
    </main>
    <RecipeDetails recipe={selected} onClose={() => setSelected(null)} onEdit={openEdit} onDelete={deleteRecipe}/>
    <Toast toast={toast} onClose={() => setToast(null)}/>
  </div>;
}
