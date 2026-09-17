import { Capacitor } from '@capacitor/core'

const MIN_GAMES_BEFORE_ADS = 2
const DEFEATS_BETWEEN_ADS = 3
const MIN_MS_BETWEEN_ADS = 180000

let initialized = false
let canRequestAds = false
let prepared = false
let adMobApi = null

function getAdUnitId() {
  const platform = Capacitor.getPlatform()
  if (platform === 'android') return import.meta.env.VITE_ADMOB_INTERSTITIAL_ANDROID || ''
  if (platform === 'ios') return import.meta.env.VITE_ADMOB_INTERSTITIAL_IOS || ''
  return ''
}

async function ensureAdMob() {
  if (!Capacitor.isNativePlatform()) return false
  if (initialized) return canRequestAds

  const { AdMob, AdmobConsentStatus } = await import('@capacitor-community/admob')
  adMobApi = AdMob
  await AdMob.initialize()

  let consentInfo = await AdMob.requestConsentInfo()
  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
    consentInfo = await AdMob.showConsentForm()
  }

  initialized = true
  canRequestAds = Boolean(consentInfo.canRequestAds)
  return canRequestAds
}

async function prepareInterstitial() {
  const adId = getAdUnitId()
  if (!adId || !(await ensureAdMob())) return false

  try {
    await adMobApi.prepareInterstitial({ adId })
    prepared = true
    return true
  } catch (error) {
    console.warn('Whichly: impossible de préparer la publicité interstitielle.', error)
    prepared = false
    return false
  }
}

export async function warmUpAds() {
  try {
    if (await ensureAdMob()) await prepareInterstitial()
  } catch (error) {
    console.warn('Whichly: initialisation AdMob ignorée.', error)
  }
}

export async function maybeShowDefeatAd() {
  const defeats = Number(sessionStorage.getItem('whichly-session-defeats') || 0) + 1
  sessionStorage.setItem('whichly-session-defeats', String(defeats))

  if (defeats <= MIN_GAMES_BEFORE_ADS) return false
  if (defeats % DEFEATS_BETWEEN_ADS !== 0) return false

  const lastShown = Number(localStorage.getItem('whichly-last-ad-at') || 0)
  if (Date.now() - lastShown < MIN_MS_BETWEEN_ADS) return false

  try {
    if (!(await ensureAdMob())) return false
    if (!prepared && !(await prepareInterstitial())) return false

    await adMobApi.showInterstitial()
    localStorage.setItem('whichly-last-ad-at', String(Date.now()))
    prepared = false
    void prepareInterstitial()
    return true
  } catch (error) {
    console.warn('Whichly: publicité interstitielle ignorée.', error)
    prepared = false
    void prepareInterstitial()
    return false
  }
}
