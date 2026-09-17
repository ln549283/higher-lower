import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Download, Flag, RotateCcw, Trophy, X } from 'lucide-react'
import questions from './data/questions.js'

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function flipQuestion(q) {
  return {
    ...q,
    left: q.right,
    right: q.left,
    answer: q.answer === 'left' ? 'right' : 'left'
  }
}

function buildDeck(source, max = 600) {
  const byCategory = new Map()
  for (const q of shuffle(source)) {
    if (!byCategory.has(q.category)) byCategory.set(q.category, [])
    byCategory.get(q.category).push(q)
  }

  const result = []
  const recentCategories = []
  const recentEntities = []
  let leftAnswers = 0
  let rightAnswers = 0

  while (result.length < max) {
    const available = [...byCategory.entries()].filter(([, pool]) => pool.length)
    if (!available.length) break

    let categoryOptions = available.filter(([category]) => !recentCategories.slice(-2).includes(category))
    if (!categoryOptions.length) categoryOptions = available
    const [category, pool] = categoryOptions[Math.floor(Math.random() * categoryOptions.length)]

    const blocked = new Set(recentEntities.slice(-14))
    let candidateIndex = pool.findIndex(q => !blocked.has(q.left.label) && !blocked.has(q.right.label))
    if (candidateIndex < 0) candidateIndex = 0

    let q = pool.splice(candidateIndex, 1)[0]
    const preferredSide = leftAnswers > rightAnswers ? 'right' : rightAnswers > leftAnswers ? 'left' : (Math.random() < .5 ? 'left' : 'right')
    if (q.answer !== preferredSide) q = flipQuestion(q)

    if (q.answer === 'left') leftAnswers++
    else rightAnswers++

    result.push(q)
    recentCategories.push(category)
    recentEntities.push(q.left.label, q.right.label)
  }

  return result
}

const tones = ['blue', 'violet', 'green', 'orange', 'rose', 'cyan']
function categoryTone(category) {
  let hash = 0
  for (const char of category) hash = (hash + char.charCodeAt(0)) % tones.length
  return tones[hash]
}

function formatValue(value, unit) {
  return `${Number(value).toLocaleString('fr-FR')} ${unit}`.trim()
}

function App() {
  const [screen, setScreen] = useState('home')
  const [deck, setDeck] = useState(() => buildDeck(questions))
  const [index, setIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('hl-best') || 0))
  const [feedback, setFeedback] = useState(null)
  const [chosenSide, setChosenSide] = useState(null)
  const [failedQuestion, setFailedQuestion] = useState(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  const q = deck[index % deck.length]
  const reportTarget = failedQuestion || q
  const tone = useMemo(() => categoryTone(q?.category || 'Quiz'), [q?.category])

  useEffect(() => {
    const onInstallPrompt = event => {
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

  function startGame() {
    setDeck(buildDeck(questions))
    setIndex(0)
    setStreak(0)
    setFeedback(null)
    setChosenSide(null)
    setFailedQuestion(null)
    setIsNewRecord(false)
    setShowReport(false)
    setScreen('game')
  }

  function answer(side) {
    if (feedback) return
    const ok = side === q.answer
    setChosenSide(side)
    setFeedback(ok ? 'correct' : 'wrong')
    navigator.vibrate?.(ok ? 25 : [60, 30, 80])

    if (ok) {
      const next = streak + 1
      setStreak(next)
      if (next > best) {
        setBest(next)
        localStorage.setItem('hl-best', String(next))
      }
      return
    }

    const brokeRecord = streak > best
    if (brokeRecord) {
      setBest(streak)
      localStorage.setItem('hl-best', String(streak))
    }
    setIsNewRecord(brokeRecord)
    setFailedQuestion(q)
  }

  function continueGame() {
    if (feedback === 'wrong') {
      setScreen('gameover')
      setFeedback(null)
      setChosenSide(null)
      return
    }

    let nextIndex = index + 1
    if (nextIndex >= deck.length) {
      setDeck(buildDeck(questions))
      nextIndex = 0
    }
    setIndex(nextIndex)
    setFeedback(null)
    setChosenSide(null)
  }

  async function reportQuestion() {
    const target = reportTarget
    const payload = [
      `Signalement question ${target.id}`,
      `Catégorie: ${target.category}`,
      `Gauche: ${target.left.label} = ${formatValue(target.left.value, target.unit)}`,
      `Droite: ${target.right.label} = ${formatValue(target.right.value, target.unit)}`,
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
      alert('Signalement copié dans le presse-papiers.')
    } catch {
      alert(payload)
    }
    setShowReport(false)
  }

  function cardState(side) {
    if (!feedback) return ''
    if (side === q.answer) return 'is-answer'
    if (side === chosenSide) return 'is-picked-wrong'
    return 'is-muted'
  }

  return (
    <main className="app-shell">
      <section className="phone-shell">
        {screen === 'home' && (
          <div className="home-screen">
            <header className="home-top">
              <div className="mini-brand">H/L</div>
              {installPrompt && <button className="icon-button" onClick={installApp} aria-label="Installer"><Download size={19}/></button>}
            </header>

            <div className="hero-art" aria-hidden="true">
              <div className="sun" />
              <div className="mountain mountain-back" />
              <div className="mountain mountain-front" />
              <div className="ground" />
            </div>

            <div className="home-copy">
              <span className="eyebrow-home">Le quiz où une erreur suffit</span>
              <h1 className="home-title">Higher<br/>Lower</h1>
              <p>Compare. Apprends. Fais la plus longue série.</p>
            </div>

            <button className="play-button" onClick={startGame}>Jouer <ArrowRight size={20}/></button>

            <div className="home-stats">
              <div><Trophy size={18}/><span>Meilleur score</span><strong>{best}</strong></div>
              <div><span className="bank-icon">#</span><span>Questions</span><strong>{questions.length.toLocaleString('fr-FR')}</strong></div>
            </div>
          </div>
        )}

        {screen === 'game' && (
          <div className="game-screen">
            <header className="game-topbar">
              <button className="close-game" onClick={() => setScreen('home')} aria-label="Quitter"><X size={21}/></button>
              <div className="score-pair"><span>Série<strong>{streak}</strong></span><span>Meilleur<strong>{best}</strong></span></div>
            </header>

            <div className="progress-line"><span style={{ width: `${Math.min(100, (streak % 10) * 10)}%` }} /></div>

            <div className={`category-chip tone-${tone}`}>{q.category}</div>
            <h2 className="question-title">{q.prompt}</h2>

            {feedback && (
              <div className={`feedback-banner ${feedback}`}>
                <span>{feedback === 'correct' ? <Check size={22}/> : <X size={22}/>}</span>
                <strong>{feedback === 'correct' ? 'Bonne réponse !' : 'Mauvaise réponse'}</strong>
              </div>
            )}

            <div className="comparison-grid">
              {['left', 'right'].map(side => {
                const item = q[side]
                return (
                  <button key={side} className={`choice-card ${cardState(side)}`} onClick={() => answer(side)} disabled={Boolean(feedback)}>
                    <div className={`card-accent tone-${tone}`} />
                    <span className="choice-letter">{side === 'left' ? 'A' : 'B'}</span>
                    <strong>{item.label}</strong>
                    {!feedback && <span className="choose-text">Choisir</span>}
                    {feedback && <span className="answer-value">{formatValue(item.value, q.unit)}</span>}
                  </button>
                )
              })}
              <div className="versus-dot">VS</div>
            </div>

            {feedback ? (
              <button className="continue-button" onClick={continueGame}>{feedback === 'correct' ? 'Continuer' : 'Voir le résultat'} <ArrowRight size={19}/></button>
            ) : (
              <button className="report-link" onClick={() => setShowReport(true)}><Flag size={15}/> Signaler cette question</button>
            )}
          </div>
        )}

        {screen === 'gameover' && (
          <div className="gameover-screen">
            <div className="result-mark">{isNewRecord ? <Trophy size={30}/> : <X size={28}/>}</div>
            <span className="result-label">Partie terminée</span>
            <h2>{isNewRecord ? 'Nouveau record !' : 'Belle série !'}</h2>
            <div className="big-score">{streak}</div>
            <span className="score-caption">bonnes réponses d’affilée</span>

            {failedQuestion && (
              <div className="recap-card">
                <span>La bonne réponse était</span>
                <strong>{failedQuestion.answer === 'left' ? failedQuestion.left.label : failedQuestion.right.label}</strong>
                <small>{failedQuestion.left.label} · {formatValue(failedQuestion.left.value, failedQuestion.unit)}<br/>{failedQuestion.right.label} · {formatValue(failedQuestion.right.value, failedQuestion.unit)}</small>
              </div>
            )}

            <button className="play-button" onClick={startGame}><RotateCcw size={18}/> Rejouer</button>
            <button className="text-button" onClick={() => setShowReport(true)}><Flag size={15}/> Cette réponse semble fausse</button>
            <button className="home-link" onClick={() => setScreen('home')}>Retour à l’accueil</button>
          </div>
        )}
      </section>

      {showReport && (
        <div className="modal-backdrop" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReport(false)} aria-label="Fermer"><X size={20}/></button>
            <span className="modal-eyebrow">QUESTION {reportTarget.id.toUpperCase()}</span>
            <h3>Cette réponse te semble incorrecte ?</h3>
            <div className="report-summary">
              <strong>{reportTarget.left.label} vs {reportTarget.right.label}</strong>
              <span>{formatValue(reportTarget.left.value, reportTarget.unit)} · {formatValue(reportTarget.right.value, reportTarget.unit)}</span>
            </div>
            <p>Le signalement contient automatiquement les valeurs et la réponse annoncée.</p>
            <button className="continue-button" onClick={reportQuestion}><Flag size={17}/> Envoyer / partager</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
