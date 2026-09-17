import { useEffect, useState } from 'react'
import { ArrowUp, Download, Flag, RotateCcw, Trophy, Flame, X } from 'lucide-react'
import questions from './data/questions.js'

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function App() {
  const [deck, setDeck] = useState(() => shuffle(questions))
  const [index, setIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('hl-best') || 0))
  const [status, setStatus] = useState('playing')
  const [feedback, setFeedback] = useState(null)
  const [chosenSide, setChosenSide] = useState(null)
  const [failedQuestion, setFailedQuestion] = useState(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  const q = deck[index % deck.length]
  const reportTarget = failedQuestion || q

  useEffect(() => {
    const onInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', onInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onInstallPrompt)
  }, [])

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  function answer(side) {
    if (status !== 'playing' || feedback) return

    const ok = side === q.answer
    setChosenSide(side)
    setFeedback(ok ? 'correct' : 'wrong')
    navigator.vibrate?.(ok ? 25 : [60, 30, 80])

    if (ok) {
      setTimeout(() => {
        const next = streak + 1
        setStreak(next)
        if (next > best) {
          setBest(next)
          localStorage.setItem('hl-best', String(next))
        }
        setIndex(i => i + 1)
        setChosenSide(null)
        setFeedback(null)
      }, 600)
      return
    }

    const brokeRecord = streak > best
    if (brokeRecord) {
      setBest(streak)
      localStorage.setItem('hl-best', String(streak))
    }
    setIsNewRecord(brokeRecord)
    setFailedQuestion(q)

    setTimeout(() => {
      setStatus('gameover')
      setFeedback(null)
      setChosenSide(null)
    }, 950)
  }

  function restart() {
    setDeck(shuffle(questions))
    setIndex(0)
    setStreak(0)
    setStatus('playing')
    setFeedback(null)
    setChosenSide(null)
    setFailedQuestion(null)
    setIsNewRecord(false)
    setShowReport(false)
  }

  async function reportQuestion() {
    const target = reportTarget
    const payload = [
      `Signalement question ${target.id}`,
      `Catégorie: ${target.category}`,
      `Gauche: ${target.left.label} = ${target.left.value} ${target.unit}`,
      `Droite: ${target.right.label} = ${target.right.value} ${target.unit}`,
      `Réponse annoncée: ${target.answer === 'left' ? target.left.label : target.right.label}`,
      'Motif: Je pense que cette réponse est incorrecte.'
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: `Signalement ${target.id}`, text: payload })
        setShowReport(false)
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(payload)
      alert('Signalement copié. Tu peux le transmettre au support.')
    } catch {
      alert(payload)
    }
    setShowReport(false)
  }

  function cardState(side) {
    if (!feedback) return ''
    if (side === q.answer) return 'is-answer'
    if (side === chosenSide) return 'is-picked-wrong'
    return ''
  }

  return (
    <main className="app-shell">
      <div className="noise" />
      <section className="game">
        <header className="topbar">
          <div className="brand"><span className="brand-dot" />HIGHER<span>/</span>LOWER</div>
          <div className="top-actions">
            {installPrompt && <button className="install" onClick={installApp} aria-label="Installer l'application"><Download size={15}/> Installer</button>}
            <div className="best"><Trophy size={16}/> {best}</div>
          </div>
        </header>

        {status === 'playing' ? (
          <>
            <div className="streak"><Flame size={20}/><strong>{streak}</strong><span>SÉRIE</span></div>
            <div className="category">{q.category}</div>
            <h1>{q.prompt}</h1>

            <div className={`versus ${feedback ? `has-feedback is-${feedback}` : ''}`}>
              <button className={`card card-left ${cardState('left')}`} onClick={() => answer('left')} disabled={Boolean(feedback)}>
                <span className="pick-icon"><ArrowUp size={20}/></span>
                <span className="label">{q.left.label}</span>
                <span className="tap">CHOISIR</span>
                {feedback && <span className="value">{q.left.value.toLocaleString('fr-FR')} {q.unit}</span>}
              </button>

              <div className="vs">VS</div>

              <button className={`card card-right ${cardState('right')}`} onClick={() => answer('right')} disabled={Boolean(feedback)}>
                <span className="pick-icon"><ArrowUp size={20}/></span>
                <span className="label">{q.right.label}</span>
                <span className="tap">CHOISIR</span>
                {feedback && <span className="value">{q.right.value.toLocaleString('fr-FR')} {q.unit}</span>}
              </button>
            </div>

            <button className="report-link" onClick={() => setShowReport(true)}><Flag size={15}/> Signaler cette question</button>
            <p className="microcopy">Une erreur termine la série. Jusqu'où iras-tu ?</p>
          </>
        ) : (
          <div className="gameover">
            <div className="gameover-icon"><Flame size={34}/></div>
            <p>FIN DE SÉRIE</p>
            <div className="final-score">{streak}</div>
            <h2>{isNewRecord ? 'Nouveau record !' : 'Série terminée.'}</h2>

            {failedQuestion && (
              <div className="answer-recap">
                <span>Bonne réponse</span>
                <strong>{failedQuestion.answer === 'left' ? failedQuestion.left.label : failedQuestion.right.label}</strong>
                <small>
                  {failedQuestion.left.label} : {failedQuestion.left.value.toLocaleString('fr-FR')} {failedQuestion.unit}
                  {' • '}
                  {failedQuestion.right.label} : {failedQuestion.right.value.toLocaleString('fr-FR')} {failedQuestion.unit}
                </small>
              </div>
            )}

            <button className="primary" onClick={restart}><RotateCcw size={18}/> Rejouer</button>
            <button className="secondary" onClick={() => setShowReport(true)}><Flag size={16}/> Cette réponse semble fausse</button>
          </div>
        )}

        <footer>{questions.length} comparaisons • record sauvegardé sur l'appareil</footer>
      </section>

      {showReport && (
        <div className="modal-backdrop" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowReport(false)} aria-label="Fermer"><X/></button>
            <span className="eyebrow">QUESTION {reportTarget.id.toUpperCase()}</span>
            <h3>Une réponse te semble fausse ?</h3>
            <p>Le signalement contient automatiquement la question, les deux valeurs et la réponse annoncée.</p>
            <button className="primary" onClick={reportQuestion}><Flag size={18}/> Envoyer / partager</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
