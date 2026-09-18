import { Capacitor } from '@capacitor/core'

const MIN_GAMES_BEFORE_ADS = 2
const DEFEATS_BETWEEN_ADS = 3
const MIN_MS_BETWEEN_ADS = 180000
const GOOGLE_TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712'
const TEST_MODE = import.meta.env.VITE_ADMOB_TEST_MODE !== 'false'

let initialized = false
let canRequestAds = false
let privacyOptionsRequired = false
let prepared = false
let adMobApi = null

function getAdUnitId() {
  const platform = Capacitor.getPlatform()
  if (platform === 'android') {
    return TEST_MODE ? GOOGLE_TEST_INTERSTITIAL_ANDROID : (import.meta.env.VITE_ADMOB_INTERSTITIAL_ANDROID || '')
  }
  if (platform === 'ios') return import.meta.env.VITE_ADMOB_INTERSTITIAL_IOS || ''
  return ''
}

async function ensureAdMob() {
  if (!Capacitor.isNativePlatform()) {
    return { canRequestAds: false, privacyOptionsRequired: false, isNative: false }
  }

  if (initialized) {
    return { canRequestAds, privacyOptionsRequired, isNative: true }
  }

  const { AdMob, AdmobConsentStatus, PrivacyOptionsRequirementStatus } = await import('@capacitor-community/admob')
  adMobApi = AdMob
  await AdMob.initialize()

  let consentInfo = await AdMob.requestConsentInfo()
  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
    consentInfo = await AdMob.showConsentForm()
  }

  initialized = true
  canRequestAds = Boolean(consentInfo.canRequestAds)
  privacyOptionsRequired = consentInfo.privacyOptionsRequirementStatus === PrivacyOptionsRequirementStatus.REQUIRED

  return { canRequestAds, privacyOptionsRequired, isNative: true }
}

async function prepareInterstitial() {
  const adId = getAdUnitId()
  const status = await ensureAdMob()
  if (!adId || !status.canRequestAds) return false

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
    const status = await ensureAdMob()
    if (status.canRequestAds) await prepareInterstitial()
    return status
  } catch (error) {
    console.warn('Whichly: initialisation AdMob ignorée.', error)
    return { canRequestAds: false, privacyOptionsRequired: false, isNative: Capacitor.isNativePlatform() }
  }
}

export async function showPrivacyOptions() {
  try {
    const status = await ensureAdMob()
    if (!status.isNative || !privacyOptionsRequired || !adMobApi) return false
    await adMobApi.showPrivacyOptionsForm()
    return true
  } catch (error) {
    console.warn('Whichly: options de confidentialité indisponibles.', error)
    return false
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
    const status = await ensureAdMob()
    if (!status.canRequestAds) return false
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
