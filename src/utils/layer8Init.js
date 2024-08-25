import { useStatStore } from 'src/stores'
import { useQuasar } from 'quasar'
export async function Layer8Init() {
  const $q = useQuasar()
  // const statsStore = useStatStore()
  // const statsApiUrl = import.meta.env.VITE_STATS_API_URL
  // const layer8Proxy = import.meta.env.VITE_LAYER8_PROXY

  try {
    // await layer8.initEncryptedTunnel(
    //   {
    //     providers: [`${statsApiUrl}`],
    //     proxy: layer8Proxy
    //   },
    //   'dev'
    // )
    // statsStore.setInitialized(true)
  } catch (err) {
    $q.notify({ type: 'negative', message: `Encrypted Tunnel establishing error` })
    console.log('.initEncryptedTunnel error: ', err)
  }
}
