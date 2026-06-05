/* audit-contacts-quiz.jsx — Audit form, Contacts, Quiz modal, Footer. */
const { useState: useStateC, useEffect: useEffectC } = React;

/* Shared form field */
function Field({ label, children, error }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {error && <span style={{ color: '#ff5a4d', fontSize: 13 }}>{error}</span>}
    </div>);

}

function useLeadForm(toast, successMsg) {
  const [v, setV] = useStateC({ name: '', phone: '', task: '', consent: true });
  const [err, setErr] = useStateC({});
  const [sent, setSent] = useStateC(false);
  const set = (k) => (e) => {
    const val = k === 'consent' ? e.target.checked : k === 'phone' ? maskPhone(e.target.value) : e.target.value;
    setV((s) => ({ ...s, [k]: val }));
    if (err[k]) setErr((s) => ({ ...s, [k]: undefined }));
  };
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (v.name.trim().length < 2) next.name = 'Как к вам обращаться?';
    if (!phoneValid(v.phone)) next.phone = 'Укажите телефон полностью';
    if (!v.consent) next.consent = 'Нужно согласие на обработку данных';
    setErr(next);
    if (Object.keys(next).length) return;
    setSent(true);
    toast(successMsg);
  };
  return { v, err, sent, set, submit, reset: () => {setV({ name: '', phone: '', task: '', consent: true });setSent(false);} };
}

/* ---------------- AUDIT (lead magnet) ---------------- */
function Audit() {
  const toast = useToast();
  const f = useLeadForm(toast, 'Заявка на аудит отправлена. Я перезвоню лично.');
  return (
    <section id="audit" className="sec bg-pg">
      <div className="wrap two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div className="reveal">
          <span className="eyebrow">Бесплатный аудит</span>
          <h2 className="section-title">Ваш маркетинг сливает бюджет?<br />Проверю бесплатно</h2>
          <p className="lead" style={{ marginTop: 24 }}>
            Я проанализирую вашу рекламу, сайт и аналитику — и покажу, где теряются заявки и деньги.
            Без обязательств: просто честная картина по цифрам.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '30px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Где сливается рекламный бюджет', 'Что мешает сайту приносить заявки', 'С чего начать, чтобы получить рост'].map((t, i) =>
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--txt-2)', fontSize: 16 }}>
                <span style={{ color: 'var(--accent-bright)', flex: '0 0 auto', display: 'inline-flex' }}><IconCheck size={20} /></span>{t}
              </li>
            )}
          </ul>
        </div>
        <div className="reveal card" style={{ padding: 36 }}>
          {f.sent ? <SuccessPanel onReset={f.reset} title="Готово!" text="Я получил заявку и перезвоню лично, чтобы договориться об аудите." /> :

          <form onSubmit={f.submit} noValidate>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 22px', color: 'var(--txt)' }}>Заказать аудит</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Как вас зовут" error={f.err.name}>
                  <input className={'input' + (f.err.name ? ' err' : '')} value={f.v.name} onChange={f.set('name')} placeholder="Имя" />
                </Field>
                <Field label="Телефон" error={f.err.phone}>
                  <input className={'input' + (f.err.phone ? ' err' : '')} value={f.v.phone} onChange={f.set('phone')} placeholder="+7 (___) ___-__-__" inputMode="tel" />
                </Field>
                <Field label="Что за задача (необязательно)">
                  <textarea className="textarea" value={f.v.task} onChange={f.set('task')} placeholder="Коротко опишите бизнес и что хотите улучшить" />
                </Field>
                <label className="consent">
                  <input type="checkbox" checked={f.v.consent} onChange={f.set('consent')} />
                  <span>Согласен на обработку персональных данных в соответствии с политикой конфиденциальности.</span>
                </label>
                {f.err.consent && <span style={{ color: '#ff5a4d', fontSize: 13, marginTop: -8 }}>{f.err.consent}</span>}
                <button type="submit" className="btn btn-fill btn-lg" style={{ width: '100%' }}>
                  Заказать аудит<IconArrowRight size={18} />
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </section>);

}

function SuccessPanel({ title, text, onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 8px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 'var(--r-full)', background: 'var(--accent)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <IconCheck size={32} style={{ color: 'var(--accent-ink)' }} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '0 0 12px', color: 'var(--txt)' }}>{title}</h3>
      <p className="muted" style={{ fontSize: 16, lineHeight: 1.5, margin: '0 auto', maxWidth: 320 }}>{text}</p>
      {onReset && <button className="btn btn-ghost btn-sm" style={{ marginTop: 22 }} onClick={onReset}>Отправить ещё одну</button>}
    </div>);

}

/* ---------------- CONTACTS ---------------- */
function Contacts() {
  const toast = useToast();
  const f = useLeadForm(toast, 'Заявка отправлена. Я перезвоню лично.');
  return (
    <section id="contacts" className="sec bg-b" style={{ overflow: 'hidden' }}>
      <Atmos glows={[1, 2]} pattern="grid" drifting={true} />
      <div className="wrap two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        <div className="reveal">
          <span className="eyebrow">Контакты</span>
          <h2 className="section-title">Свяжитесь со мной — разберём вашу задачу</h2>
          <p className="lead" style={{ marginTop: 22 }}>Напишите в Telegram или оставьте номер — я перезвоню лично, без колл-центра и менеджеров.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32 }}>
            <a className="contact-row" href="tel:+79963470065"
            onClick={() => toast('Звонок: +7 (996) 347-00-65')}>
              <span className="icon-tile" style={{ width: 50, height: 50 }}><IconPhone size={22} /></span>
              <div>
                <div style={{ color: 'var(--txt-3)', fontSize: 13 }}>Телефон</div>
                <div style={{ fontSize: 19, fontWeight: 600 }}>+7 (996) 347-00-65</div>
              </div>
            </a>
            <a className="contact-row" href="https://t.me/Daniil_065" target="_blank" rel="noopener">
              <span className="icon-tile" style={{ width: 50, height: 50 }}><IconSend size={22} /></span>
              <div>
                <div style={{ color: 'var(--txt-3)', fontSize: 13 }}>Telegram · Max</div>
                <div style={{ fontSize: 19, fontWeight: 600 }}>@Daniil_065</div>
              </div>
            </a>
          </div>
        </div>
        <div className="reveal card" style={{ padding: 36 }} id="contact-form">
          {f.sent ? <SuccessPanel onReset={f.reset} title="Спасибо!" text="Заявка у меня. Я перезвоню лично и предложу время для разговора." /> :

          <form onSubmit={f.submit} noValidate>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 6px', color: "rgb(255, 255, 255)" }}>Заказать звонок</h3>
              <p className="muted" style={{ margin: '0 0 22px', fontSize: 15 }}>Я перезвоню лично</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Как вас зовут" error={f.err.name}>
                  <input className={'input' + (f.err.name ? ' err' : '')} value={f.v.name} onChange={f.set('name')} placeholder="Имя" />
                </Field>
                <Field label="Телефон" error={f.err.phone}>
                  <input className={'input' + (f.err.phone ? ' err' : '')} value={f.v.phone} onChange={f.set('phone')} placeholder="+7 (___) ___-__-__" inputMode="tel" />
                </Field>
                <Field label="Задача (необязательно)">
                  <textarea className="textarea" value={f.v.task} onChange={f.set('task')} placeholder="О чём хотите поговорить" />
                </Field>
                <label className="consent">
                  <input type="checkbox" checked={f.v.consent} onChange={f.set('consent')} />
                  <span>Согласен на обработку персональных данных.</span>
                </label>
                {f.err.consent && <span style={{ color: '#ff5a4d', fontSize: 13, marginTop: -8 }}>{f.err.consent}</span>}
                <button type="submit" className="btn btn-fill btn-lg" style={{ width: '100%' }}>
                  Жду звонка<IconPhone size={18} />
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </section>);

}

/* ---------------- QUIZ MODAL ---------------- */
function QuizModal({ open, onClose }) {
  const toast = useToast();
  const [step, setStep] = useStateC(0);
  const [ans, setAns] = useStateC({});
  const [phase, setPhase] = useStateC('q'); // q | form | done
  const f = useLeadForm(toast, 'Заявка отправлена. Скидка 10% закреплена за вами.');

  useEffectC(() => {
    if (open) {setStep(0);setAns({});setPhase('q');f.reset();}
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {document.body.style.overflow = '';};
  }, [open]);
  useEffectC(() => {
    const esc = (e) => {if (e.key === 'Escape') onClose();};
    if (open) window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;
  const total = QUIZ_STEPS.length;
  const pick = (opt) => {
    setAns((a) => ({ ...a, [step]: opt }));
    setTimeout(() => {if (step < total - 1) setStep(step + 1);else setPhase('form');}, 180);
  };
  const pct = phase === 'form' ? 100 : Math.round(step / total * 100);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'toastIn .3s ease' }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: 'var(--tile-b)',
        width: 'min(560px, 100%)', maxHeight: '90vh', overflowY: 'auto', borderColor: 'var(--line-strong)' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--line)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--tile-b)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="chip" style={{ padding: '6px 12px', color: 'var(--accent-bright)', borderColor: 'var(--accent-soft-bd)', background: 'var(--accent-soft)' }}>
              <IconStar size={14} />Скидка 10%
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--txt-2)', cursor: 'pointer', padding: 6 }}>
            <IconClose size={22} />
          </button>
        </div>
        <div style={{ height: 3, background: 'var(--line)' }}>
          <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', transition: 'width .35s ease' }} />
        </div>

        <div style={{ padding: 32 }}>
          {phase === 'q' &&
          <div key={step} style={{ animation: 'toastIn .3s ease' }}>
              <div style={{ color: 'var(--txt-3)', fontSize: 14, marginBottom: 12 }}>Вопрос {step + 1} из {total}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 24px', color: 'var(--txt)' }}>
                {QUIZ_STEPS[step].q}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {QUIZ_STEPS[step].opts.map((opt, i) =>
              <button key={i} onClick={() => pick(opt)} className="quiz-opt"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', cursor: 'pointer', background: ans[step] === opt ? 'var(--accent-soft)' : 'rgba(255,255,255,0.03)',
                border: '1px solid', borderColor: ans[step] === opt ? 'var(--accent)' : 'var(--line-strong)',
                borderRadius: 'var(--r-md)', padding: '16px 20px', color: 'var(--txt)', fontSize: 17,
                transition: 'all .18s ease' }}>
                    {opt}
                    <span style={{ color: 'var(--accent-bright)', opacity: ans[step] === opt ? 1 : 0 }}><IconCheck size={20} /></span>
                  </button>
              )}
              </div>
              {step > 0 &&
            <button onClick={() => setStep(step - 1)} style={{ marginTop: 20, background: 'none', border: 'none',
              color: 'var(--txt-2)', cursor: 'pointer', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconChevron size={16} style={{ transform: 'rotate(90deg)' }} />Назад
                </button>
            }
            </div>
          }

          {phase === 'form' && !f.sent &&
          <form onSubmit={f.submit} noValidate style={{ animation: 'toastIn .3s ease' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '0 0 8px', color: 'var(--txt)' }}>Куда отправить решение?</h3>
              <p className="muted" style={{ margin: '0 0 24px', fontSize: 16 }}>Подберу под ваши ответы и закреплю скидку 10%. Перезвоню лично.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Как вас зовут" error={f.err.name}>
                  <input className={'input' + (f.err.name ? ' err' : '')} value={f.v.name} onChange={f.set('name')} placeholder="Имя" />
                </Field>
                <Field label="Телефон" error={f.err.phone}>
                  <input className={'input' + (f.err.phone ? ' err' : '')} value={f.v.phone} onChange={f.set('phone')} placeholder="+7 (___) ___-__-__" inputMode="tel" />
                </Field>
                <label className="consent">
                  <input type="checkbox" checked={f.v.consent} onChange={f.set('consent')} />
                  <span>Согласен на обработку персональных данных.</span>
                </label>
                {f.err.consent && <span style={{ color: '#ff5a4d', fontSize: 13, marginTop: -8 }}>{f.err.consent}</span>}
                <button type="submit" className="btn btn-fill btn-lg" style={{ width: '100%' }}>
                  Получить решение со скидкой<IconArrowRight size={18} />
                </button>
              </div>
            </form>
          }

          {f.sent && <SuccessPanel title="Скидка 10% — ваша" text="Я получил ответы и закрепил скидку. Перезвоню лично с готовым решением." />}
        </div>
      </div>
    </div>);

}

/* ---------------- QUIZ TEASER ---------------- */
function QuizTeaser({ onOpen }) {
  return (
    <section className="sec-tight bg-pg">
      <div className="wrap">
        <div className="reveal quiz-teaser" style={{ background: 'var(--tile-card)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-lg)', padding: 'clamp(32px, 5vw, 56px)', display: 'grid',
          gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
          <div>
            <span className="chip" style={{ marginBottom: 18, color: 'var(--accent-bright)', borderColor: 'var(--accent-soft-bd)', background: 'var(--accent-soft)' }}>
              <IconStar size={14} />Скидка 10%
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}>Не знаете, с чего начать?</h2>
            <p className="lead" style={{ marginTop: 16, maxWidth: 520 }}>
              Ответьте на 4 вопроса — я пойму вашу задачу и предложу решение. А ещё закреплю за вами скидку 10%.
            </p>
          </div>
          <button className="btn btn-fill btn-lg" onClick={onOpen} style={{ whiteSpace: 'nowrap' }}>
            Пройти квиз<IconArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>);

}

/* ---------------- FOOTER ---------------- */
function Footer({ onCta }) {
  return (
    <footer className="footer">
      <div className="wrap" style={{ padding: '64px 32px 40px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 40, paddingBottom: 40,
          borderBottom: '1px solid var(--line)' }}>
          <div>
            <a className="brand" href="#top" style={{ fontSize: 20 }}><span className="dot">ДК</span>Даниил Карацапов</a>
            <p className="muted" style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.55, maxWidth: 300 }}>
              Частный интернет-маркетолог. Контекст, таргет, сайты и аналитика — лично, от аудита до заявок.
            </p>
          </div>
          <div>
            <div style={{ color: 'var(--txt-3)', fontSize: 13, marginBottom: 16 }}>Навигация</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Обо мне', '#about'], ['Услуги', '#services'], ['Кейсы', '#cases'], ['Контакты', '#contacts']].map(([t, h]) =>
              <a key={h} href={h} style={{ color: 'var(--txt-2)', textDecoration: 'none', fontSize: 15 }}>{t}</a>
              )}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--txt-3)', fontSize: 13, marginBottom: 16 }}>Связь</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="tel:+79963470065" style={{ color: 'var(--txt-2)', textDecoration: 'none', fontSize: 15 }}>+7 (996) 347-00-65</a>
              <a href="https://t.me/Daniil_065" target="_blank" rel="noopener" style={{ color: 'var(--txt-2)', textDecoration: 'none', fontSize: 15 }}>Telegram @Daniil_065</a>
              <a href="#contacts" onClick={(e) => {e.preventDefault();onCta();}} style={{ color: 'var(--accent-bright)', textDecoration: 'none', fontSize: 15 }}>Обсудить задачу</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingTop: 28 }}>
          <span className="fine">© 2026 Даниил Карацапов. Интернет-маркетинг.</span>
          <a href="#" className="fine" style={{ color: 'var(--txt-3)', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>Политика конфиденциальности</a>
        </div>
      </div>
    </footer>);

}

Object.assign(window, { Audit, Contacts, QuizModal, QuizTeaser, Footer });