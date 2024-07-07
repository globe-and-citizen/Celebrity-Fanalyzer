import layer8 from 'layer8_interceptor'
import { useStatStore } from 'src/stores'
import { useQuasar } from 'quasar'
export async function Layer8Init() {
  const $q = useQuasar()
  const statsStore = useStatStore()
  try {
    await layer8.initEncryptedTunnel(
      {
        providers: ['https://stats-api.up.railway.app/v1'],
        proxy: 'https://layer8proxy.net'
      },
      'dev'
    )
    statsStore.setInitialized(true)
  } catch (err) {
    $q.notify({ type: 'negative', message: `Encrypted Tunnel establishing error` })
    console.log('.initEncryptedTunnel error: ', err)
  }
}
