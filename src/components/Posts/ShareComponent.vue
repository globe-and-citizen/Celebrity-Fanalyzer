<template>
  <q-btn
    :data-test="disable ? '' : 'share-button'"
    :disable="disable"
    flat
    icon="share"
    :label="label"
    rounded
    :dense="dense"
    size="0.75rem"
    @click="onShare()"
  >
    <q-tooltip anchor="bottom middle" self="center middle">Share</q-tooltip>
  </q-btn>
</template>

<script setup>
import { copyToClipboard, useQuasar } from 'quasar'

const $q = useQuasar()

const emit = defineEmits(['share'])
const props = defineProps(['label', 'disable', 'link', 'dense'])

function onShare() {
  $q.bottomSheet({
    message: 'Share with Social Media',
    grid: true,
    actions: [
      { label: 'Copy to Clipboard', img: '/icons/clipboard.svg', id: 'clipboard' },
      { label: 'Facebook', img: '/icons/facebook.svg', id: 'facebook', link: 'https://facebook.com/sharer/sharer.php?u=' },
      { label: 'LinkedIn', img: '/icons/linkedin.svg', id: 'linkedin', link: 'https://linkedin.com/sharing/share-offsite/?url=' },
      { label: 'X', img: '/icons/x.svg', id: 'x', link: 'https://x.com/intent/tweet?text=' },
      { label: 'Discord', img: '/icons/discord.svg', id: 'discord', link: 'https://discordapp.com/channels/' },
      { label: 'Telegram', img: '/icons/telegram.svg', id: 'telegram', link: 'https://t.me/share/url?url=' },
      { label: 'WhatsApp', img: '/icons/whatsapp.svg', id: 'whatsapp', link: 'https://api.whatsapp.com/send?text=' },
      { label: 'Reddit', img: '/icons/reddit.svg', id: 'reddit', link: 'https://reddit.com/submit?url=' },
      { label: 'Pinterest', img: '/icons/pinterest.svg', id: 'pinterest', link: 'https://pinterest.com/pin/create/button/?url=' },
      {
        label: 'Odnoklassniki',
        img: '/icons/odnoklassniki.svg',
        id: 'odnoklassniki',
        link: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl='
      }
    ]
  }).onOk((action) => {
    if (action.id === 'clipboard') {
      copyToClipboard(props?.link ? props.link : window.location.href)
    } else if (action.id === 'facebook' || action.id === 'linkedin') {
      window.open(action.link + `${props?.link ? props.link : window.location.href}`, '_blank')
    } else {
      window.open(
        action.link + `Look what I just found on CelebrityFanalyzer: ${props?.link ? props.link : window.location.href}`,
        '_blank'
      )
    }

    emit('share', action.id)
  })
}
</script>
