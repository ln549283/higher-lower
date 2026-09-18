import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BarChart3, Check, Download, Flag, RotateCcw, Trophy, X } from 'lucide-react'
import questions from './data/questions.js'
import { maybeShowDefeatAd, warmUpAds } from './ads.js'

const APP_VERSION = '1.0.0'

function WhichlyMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 52 52" aria-hidden="true">
      <path d="M8 13 19.5 39 26 25.5 32.5 39 44 13" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="13" r="3.2" className="mark-dot mark-dot-left"/>
      <circle cx="44" cy="13" r="3.2" className="mark-dot mark-dot-right"/>
    </svg>
  )
}


function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function flipQuestion(q) {
  return { ...q, left: q.right, right: q.left, answer: q.answer === 'left' ? 'right' : 'left' }
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

const DEFAULT_STATS = { games: 0, answers: 0, correct: 0, streakTotal: 0, categories: {} }
const REPORT_REASONS = ['Réponse incorrecte', 'Question mal formulée', 'Question mal écrite', 'Contenu inapproprié', 'Contenu offensant', 'Contenu déplacé', 'Autre']

function loadStats() {
  try { return { ...DEFAULT_STATS, ...JSON.parse(localStorage.getItem('hl-stats') || '{}') } }
  catch { return DEFAULT_STATS }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [deck, setDeck] = useState(() => buildDeck(questions))
  const [index, setIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('hl-best') || 0))
  const [stats, setStats] = useState(loadStats)
  const [feedback, setFeedback] = useState(null)
  const [chosenSide, setChosenSide] = useState(null)
  const [failedQuestion, setFailedQuestion] = useState(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportDetails, setReportDetails] = useState('')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [runAnswers, setRunAnswers] = useState(0)

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

  useEffect(() => {
    localStorage.setItem('hl-stats', JSON.stringify(stats))
  }, [stats])

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  function startGame() {
    void warmUpAds()
    setDeck(buildDeck(questions))
    setIndex(0)
    setStreak(0)
    setRunAnswers(0)
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
    setRunAnswers(v => v + 1)
    navigator.vibrate?.(ok ? 25 : [60, 30, 80])

    setStats(current => {
      const cat = current.categories[q.category] || { played: 0, correct: 0 }
      return {
        ...current,
        answers: current.answers + 1,
        correct: current.correct + (ok ? 1 : 0),
        categories: {
          ...current.categories,
          [q.category]: { played: cat.played + 1, correct: cat.correct + (ok ? 1 : 0) }
        }
      }
    })

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

  function finishGame() {
    setStats(current => ({ ...current, games: current.games + 1, streakTotal: current.streakTotal + streak }))
  }

  async function continueGame() {
    if (feedback === 'wrong') {
      finishGame()
      await maybeShowDefeatAd()
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

  function confirmExit() {
    if (runAnswers > 0) finishGame()
    setShowExitConfirm(false)
    setScreen('home')
  }

  function openReport() {
    setReportReason(REPORT_REASONS[0])
    setReportDetails('')
    setShowReport(true)
  }

  async function reportQuestion() {
    const target = reportTarget
    const payload = [
      `Signalement question ${target.id}`,
      `Catégorie: ${target.category}`,
      `Gauche: ${target.left.label} = ${formatValue(target.left.value, target.unit)}`,
      `Droite: ${target.right.label} = ${formatValue(target.right.value, target.unit)}`,
      `Réponse annoncée: ${target.answer === 'left' ? target.left.label : target.right.label}`,
      `Motif: ${reportReason}`,
      reportDetails.trim() ? `Détails: ${reportDetails.trim()}` : null
    ].filter(Boolean).join('\n')

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

  const precision = stats.answers ? Math.round((stats.correct / stats.answers) * 100) : 0
  const avgStreak = stats.games ? (stats.streakTotal / stats.games).toFixed(1) : '0'
  const categoryRows = Object.entries(stats.categories)
    .filter(([, value]) => value.played >= 2)
    .map(([category, value]) => ({ category, played: value.played, rate: Math.round((value.correct / value.played) * 100) }))
    .sort((a, b) => b.rate - a.rate || b.played - a.played)

  return (
    <main className="app-shell">
      <section className="phone-shell">
        {screen === 'home' && (
          <div className="home-screen home-native">
            <header className="home-top">
              <div className="mini-brand" aria-label="Whichly"><WhichlyMark className="mini-brand-mark"/></div>
              <div className="home-actions">
                {installPrompt && <button className="icon-button" onClick={installApp} aria-label="Installer"><Download size={19}/></button>}
                <button className="icon-button" onClick={() => setScreen('stats')} aria-label="Statistiques"><BarChart3 size={19}/></button>
              </div>
            </header>

            <div className="home-center">
              <div className="app-badge">COMPARE · APPRENDS · ENCHAÎNE</div>
              <h1 className="home-title native-title">Whichly</h1>
              <p>Deux choix. Une seule bonne réponse.<br/>Jusqu’où ira ta série ?</p>
              <div className="record-pill"><Trophy size={18}/><span>Meilleur score</span><strong>{best}</strong></div>
              <button className="play-button primary-home" onClick={startGame}>Jouer <ArrowRight size={20}/></button>
              <button className="stats-shortcut" onClick={() => setScreen('stats')}><BarChart3 size={17}/> Voir mes statistiques</button>
            </div>

            <footer className="home-footer">Whichly · v{APP_VERSION} · {questions.length.toLocaleString('fr-FR')} comparaisons</footer>
          </div>
        )}

        {screen === 'game' && (
          <div className="game-screen">
            <header className="game-topbar">
              <button className="close-game" onClick={() => setShowExitConfirm(true)} aria-label="Quitter"><X size={21}/></button>
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
              <button className="report-link" onClick={openReport}><Flag size={15}/> Signaler cette question</button>
            )}
          </div>
        )}

        {screen === 'gameover' && (
          <div className="gameover-screen">
            {isNewRecord && <div className="result-mark record-only"><Trophy size={30}/></div>}
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
            <button className="stats-shortcut gameover-stats" onClick={() => setScreen('stats')}><BarChart3 size={17}/> Voir mes statistiques</button>
            <button className="text-button" onClick={openReport}><Flag size={15}/> Signaler un problème avec cette question</button>
            <button className="home-link" onClick={() => setScreen('home')}>Retour à l’accueil</button>
          </div>
        )}

        {screen === 'stats' && (
          <div className="stats-screen">
            <header className="stats-topbar">
              <button className="icon-button" onClick={() => setScreen('home')} aria-label="Retour"><ArrowLeft size={20}/></button>
              <h2>Statistiques</h2>
              <div className="topbar-spacer" />
            </header>

            <div className="stats-grid">
              <div><Trophy/><span>Meilleur score</span><strong>{best}</strong></div>
              <div><BarChart3/><span>Parties jouées</span><strong>{stats.games}</strong></div>
              <div><span className="metric-symbol">Ø</span><span>Série moyenne</span><strong>{avgStreak}</strong></div>
              <div><span className="metric-symbol">%</span><span>Précision</span><strong>{precision}%</strong></div>
            </div>

            <section className="category-stats">
              <h3>Forces et axes d’amélioration</h3>
              <p>Ton taux de bonnes réponses par catégorie.</p>
              {categoryRows.length ? categoryRows.map(row => (
                <div className="category-row" key={row.category}>
                  <div className="category-row-head"><span>{row.category}</span><strong>{row.rate}%</strong></div>
                  <div className="stat-bar"><span style={{ width: `${row.rate}%` }} /></div>
                  <small>{row.played} réponses</small>
                </div>
              )) : <div className="empty-stats">Joue quelques parties pour faire apparaître tes forces et faiblesses.</div>}
            </section>
            <div className="version-label">Whichly · v{APP_VERSION}</div>
          </div>
        )}
      </section>

      {showExitConfirm && (
        <div className="modal-backdrop" onClick={() => setShowExitConfirm(false)}>
          <div className="modal compact-modal" onClick={e => e.stopPropagation()}>
            <h3>Quitter la partie ?</h3>
            <p>Ta série actuelle sera perdue.</p>
            <div className="modal-actions">
              <button className="secondary-action" onClick={() => setShowExitConfirm(false)}>Continuer</button>
              <button className="danger-action" onClick={confirmExit}>Quitter</button>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="modal-backdrop" onClick={() => setShowReport(false)}>
          <div className="modal report-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReport(false)} aria-label="Fermer"><X size={20}/></button>
            <span className="modal-eyebrow">QUESTION {reportTarget.id.toUpperCase()}</span>
            <h3>Signaler cette question</h3>
            <div className="report-summary">
              <strong>{reportTarget.left.label} vs {reportTarget.right.label}</strong>
              <span>{formatValue(reportTarget.left.value, reportTarget.unit)} · {formatValue(reportTarget.right.value, reportTarget.unit)}</span>
            </div>
            <div className="reason-list">
              {REPORT_REASONS.map(reason => (
                <label key={reason} className={reportReason === reason ? 'selected' : ''}>
                  <input type="radio" name="reportReason" value={reason} checked={reportReason === reason} onChange={() => setReportReason(reason)} />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value.slice(0, 500))} placeholder="Détails (facultatif)" rows="3" />
            <div className="char-count">{reportDetails.length}/500</div>
            <button className="continue-button" onClick={reportQuestion}><Flag size={17}/> Envoyer / partager</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
