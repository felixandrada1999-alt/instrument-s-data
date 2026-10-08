"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Activity,
  ArrowDownUp,
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  CircleAlert,
  FilePlus2,
  FlaskConical,
  ImagePlus,
  LoaderCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Instrument = {
  id: string;
  uploader_name: string;
  instrument_name: string;
  part_number: string;
  serial_number: string;
  photo_url: string;
  created_at: string;
};

const emptyForm = {
  uploaderName: "",
  instrumentName: "",
  partNumber: "",
  serialNumber: "",
};

export default function Home() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadInstruments() {
    setLoading(true);
    try {
      const response = await fetch("/api/instruments", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar el inventario.");
      setInstruments(data.instruments);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialInstruments() {
      try {
        const response = await fetch("/api/instruments", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar el inventario.");
        if (!cancelled) {
          setInstruments(data.instruments);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Error de conexión.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitialInstruments();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInstruments = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    if (!term) return instruments;
    return instruments.filter((item) =>
      [item.instrument_name, item.part_number, item.serial_number, item.uploader_name]
        .some((value) => value.toLocaleLowerCase("es").includes(term)),
    );
  }, [instruments, search]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.set(key, value));
    if (photo) body.set("photo", photo);

    try {
      const response = await fetch("/api/instruments", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el instrumento.");
      setInstruments((current) => [data.instrument, ...current]);
      setForm(emptyForm);
      setPhoto(null);
      setPhotoPreview("");
      const input = document.getElementById("photo") as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice("Instrumento registrado correctamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el registro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Instrumenta inicio">
          <span className="brand-mark"><Activity size={21} strokeWidth={2.4} /></span>
          <span className="brand-copy"><strong>instrumenta</strong><small>GESTIÓN TÉCNICA</small></span>
        </a>
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <nav className="side-nav" aria-label="Navegación principal">
          <a className="nav-item active" href="#inventario"><FlaskConical size={18} /> Inventario <span className="nav-count">{instruments.length}</span></a>
          <a className="nav-item" href="#registro"><FilePlus2 size={18} /> Nuevo registro</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><span><ShieldCheck size={17} /></span><div><strong>Datos protegidos</strong><small>Almacenamiento seguro en la nube</small></div></div>
          <div className="profile"><span className="profile-avatar">AI</span><div><strong>Andrada Instrumentos</strong><small>Panel de operaciones</small></div><ChevronDown size={16} /></div>
        </div>
      </aside>

      <section className="main-area" id="inicio">
        <header className="topbar"><div className="breadcrumb">Operaciones <span>/</span> <strong>Instrumentos</strong></div><div className="topbar-right"><span className="live-dot" /> Sistema operativo <span className="topbar-date">·&nbsp; Registro central</span></div></header>
        <div className="content-wrap">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> CONTROL DE ACTIVOS</div><h1>Instrumentos</h1><p>Un lugar claro y confiable para registrar cada instrumento.</p></div>
            <a className="primary-button heading-button" href="#registro"><ImagePlus size={17} /> Cargar instrumento</a>
          </section>

          <section className="stats-grid" aria-label="Resumen del inventario">
            <article className="stat-card stat-highlight"><div className="stat-top"><span>Total registrados</span><span className="stat-icon"><FlaskConical size={17} /></span></div><strong>{loading ? "—" : instruments.length.toString().padStart(2, "0")}</strong><small><span className="stat-trend"><ArrowUpRight size={13} /> Inventario actual</span></small></article>
            <article className="stat-card"><div className="stat-top"><span>Con fotografía</span><span className="stat-icon muted"><Camera size={17} /></span></div><strong>{loading ? "—" : instruments.filter((item) => item.photo_url).length.toString().padStart(2, "0")}</strong><small>Identificación visual disponible</small></article>
            <article className="stat-card"><div className="stat-top"><span>Último registro</span><span className="stat-icon muted"><ArrowDownUp size={17} /></span></div><strong className="last-date">{instruments[0] ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(instruments[0].created_at)) : "—"}</strong><small>{instruments[0]?.uploader_name ?? "Aún sin actividad"}</small></article>
          </section>

          <div className="workspace-grid">
            <section className="inventory-panel" id="inventario">
              <div className="panel-heading"><div><div className="panel-kicker">BASE DE DATOS</div><h2>Inventario registrado <span className="heading-count">{instruments.length}</span></h2></div><button className="filter-button" type="button" aria-label="Opciones de filtro"><SlidersHorizontal size={17} /></button></div>
              <div className="search-row"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar instrumento, parte, serie…" aria-label="Buscar en el inventario" /><kbd>⌘ K</kbd></label><button className="sort-button" type="button" onClick={() => setInstruments((items) => [...items].reverse())}>Más recientes <ChevronDown size={15} /></button></div>

              {error && <div className="inline-alert"><CircleAlert size={17} /><span>{error}</span><button type="button" onClick={() => void loadInstruments()}>Reintentar</button></div>}
              {notice && <div className="inline-success"><Check size={17} /><span>{notice}</span><button type="button" aria-label="Cerrar aviso" onClick={() => setNotice("")}><X size={15} /></button></div>}

              {loading ? <div className="empty-state"><LoaderCircle className="spin" size={24} /><p>Cargando instrumentos…</p></div> : filteredInstruments.length === 0 ? (
                <div className="empty-state"><span className="empty-icon"><FlaskConical size={23} /></span><h3>{search ? "No encontramos resultados" : "Todavía no hay instrumentos"}</h3><p>{search ? "Probá con otro número de serie o nombre." : "Cargá el primer instrumento para iniciar el inventario."}</p>{!search && <a href="#registro" className="text-link">Crear primer registro <ArrowUpRight size={15} /></a>}</div>
              ) : (
                <div className="instrument-list">
                  {filteredInstruments.map((item, index) => <article className="instrument-row" key={item.id}>
                    <div className="instrument-photo">{item.photo_url ? <Image src={item.photo_url} alt={`Fotografía de ${item.instrument_name}`} width={180} height={180} unoptimized /> : <span className={`photo-placeholder tone-${index % 4}`}><FlaskConical size={22} /></span>}</div>
                    <div className="instrument-info"><div className="instrument-title">{item.instrument_name}</div><div className="instrument-meta"><span>Parte <strong>{item.part_number}</strong></span><i /> <span>Serie <strong>{item.serial_number}</strong></span></div></div>
                    <div className="instrument-uploader"><span className="uploader-label">CARGADO POR</span><strong>{item.uploader_name}</strong></div>
                    <div className="instrument-date">{new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.created_at))}</div>
                    {item.photo_url && <a className="photo-link" href={item.photo_url} target="_blank" rel="noreferrer" aria-label={`Ver foto de ${item.instrument_name}`}><ArrowUpRight size={16} /></a>}
                  </article>)}
                </div>
              )}
              <footer className="list-footer"><span>Mostrando <strong>{filteredInstruments.length}</strong> de <strong>{instruments.length}</strong> registros</span><span className="encrypted"><ShieldCheck size={14} /> Datos sincronizados</span></footer>
            </section>

            <aside className="form-panel" id="registro">
              <div className="form-heading"><div className="form-icon"><FilePlus2 size={18} /></div><div><h2>Nuevo instrumento</h2><p>Completá los datos para registrarlo.</p></div></div>
              <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="uploaderName">Persona que carga <span>*</span></label><input className="form-input" id="uploaderName" name="uploaderName" placeholder="Nombre y apellido" autoComplete="name" required maxLength={120} value={form.uploaderName} onChange={(event) => setForm({ ...form, uploaderName: event.target.value })} />
                <label className="field-label" htmlFor="instrumentName">Nombre del instrumento <span>*</span></label><input className="form-input" id="instrumentName" name="instrumentName" placeholder="Ej. Multímetro digital" required maxLength={160} value={form.instrumentName} onChange={(event) => setForm({ ...form, instrumentName: event.target.value })} />
                <div className="field-pair"><div><label className="field-label" htmlFor="partNumber">Nro. de parte <span>*</span></label><input className="form-input" id="partNumber" name="partNumber" placeholder="Ej. 87V-MAX" required maxLength={120} value={form.partNumber} onChange={(event) => setForm({ ...form, partNumber: event.target.value })} /></div><div><label className="field-label" htmlFor="serialNumber">Nro. de serie <span>*</span></label><input className="form-input" id="serialNumber" name="serialNumber" placeholder="Ej. 45829103" required maxLength={120} value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} /></div></div>
                <label className="field-label" htmlFor="photo">Fotografía <span>*</span></label><label className={`upload-box ${photoPreview ? "has-photo" : ""}`} htmlFor="photo">{photoPreview ? <><Image src={photoPreview} alt="Vista previa de la fotografía seleccionada" width={180} height={180} unoptimized /><span className="upload-change">Cambiar imagen</span></> : <><span className="upload-icon"><Camera size={19} /></span><span className="upload-copy"><strong>Elegir fotografía</strong><small>JPG, PNG o WEBP · máx. 4 MB</small></span><ImagePlus className="upload-trailing" size={18} /></>}<input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required={!photo} onChange={handlePhotoChange} /></label>
                <button className="primary-button submit-button" type="submit" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={17} /> Guardando…</> : <><span>Guardar instrumento</span><ArrowUpRight size={17} /></>}</button>
                <p className="form-footnote"><ShieldCheck size={14} /> La información se guarda de forma segura.</p>
              </form>
            </aside>
          </div>
          <footer className="page-footer"><span>INSTRUMENTA <i>·</i> Gestión de activos</span><span>Hecho para trabajar con precisión.</span></footer>
        </div>
      </section>
    </main>
  );
}
