import { useState } from 'react'
import { ArrowUp, Flag, RotateCcw, Trophy, Flame, X } from 'lucide-react'
import questions from './data/questions.js'

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

function App() {
  const [deck, setDeck] = useState(() => shuffle(questions))
  const [index, setIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('hl-best') || 0))
  const [status, setStatus] = useState('playing')
  const [feedback, setFeedback] = useState(null)
  const [showReport, setShowReport] = useState(false)

  const q = deck[index % deck.length]

  function answer(side) {
    if (status !== 'playing' || feedback) return
    const ok = side === q.answer
    setFeedback(ok ? 'correct' : 'wrong')
    navigator.vibrate?.(ok ? 25 : [60, 30, 80])

    setTimeout(() => {
      if (ok) {
        const next = streak + 1
        setStreak(next)
        if (next > best) {
          setBest(next)
          localStorage.setItem('hl-best', String(next))
        }
        setIndex(i => i + 1)
        setFeedback(null)
      } else {
        setStatus('gameover')
        setFeedback(null)
      }
    }, 700)
  }

  function restart() {
    setDeck(shuffle(questions))
    setIndex(0)
    setStreak(0)
    setStatus('playing')
    setFeedback(null)
    setShowReport(false)
  }

  async function reportQuestion() {
    const payload = [
      `Signalement question ${q.id}`,
      `Catégorie: ${q.category}`,
      `Gauche: ${q.left.label} = ${q.left.value} ${q.unit}`,
      `Droite: ${q.right.label} = ${q.right.value} ${q.unit}`,
      `Réponse annoncée: ${q.answer === 'left' ? q.left.label : q.right.label}`,
      'Motif: Je pense que cette réponse est incorrecte.'
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: `Signalement ${q.id}`, text: payload })
        setShowReport(false)
        return
      } catch {}
    }

    await navigator.clipboard?.writeText(payload)
    alert('Signalement copié. Tu peux le transmettre au support.')
    setShowReport(false)
  }

  return (
    <main className="app-shell">
      <div className="noise" />
      <section className="game">
        <header className="topbar">
          <div className="brand"><span className="brand-dot" />HIGHER<span>/</span>LOWER</div>
          <div className="best"><Trophy size={16}/> {best}</div>
        </header>

        {status === 'playing' ? (
          <>
            <div className="streak"><Flame size={20}/><strong>{streak}</strong><span>SÉRIE</span></div>
            <div className="category">{q.category}</div>
            <h1>{q.prompt}</h1>

            <div className={`versus ${feedback ? `is-${feedback}` : ''}`}>
              <button className="card card-left" onClick={() => answer('left')}>
                <span className="pick-icon"><ArrowUp size={20}/></span>
                <span className="label">{q.left.label}</span>
                <span className="tap">CHOISIR</span>
                {feedback && <span className="value">{q.left.value.toLocaleString('fr-FR')} {q.unit}</span>}
              </button>

              <div className="vs">VS</div>

              <button className="card card-right" onClick={() => answer('right')}>
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
            <h2>{streak === best && streak > 0 ? 'Nouveau record !' : 'Belle tentative.'}</h2>
            <button className="primary" onClick={restart}><RotateCcw size={18}/> Rejouer</button>
            <button className="secondary" onClick={() => setShowReport(true)}><Flag size={16}/> Signaler la dernière question</button>
          </div>
        )}

        <footer>{questions.length} comparaisons • record sauvegardé sur l'appareil</footer>
      </section>

      {showReport && (
        <div className="modal-backdrop" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowReport(false)}><X/></button>
            <span className="eyebrow">QUESTION {q.id.toUpperCase()}</span>
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
