<script setup lang="ts">
import { reactive } from 'vue'
import { resetVfs } from '../../shared/vfs'
import { useSettingsStore } from '../stores/settings'

const settings = useSettingsStore()
settings.hydrate()
const form = reactive({ provider: settings.provider, apiKey: settings.apiKey })

function save() {
  settings.save(form)
}

function resetOs() {
  resetVfs()
  window.location.reload()
}
</script>

<template>
  <section class="settings-panel">
    <header><p>System preferences</p><h2>Settings</h2></header>
    <label>Provider<input v-model="form.provider" placeholder="openai" autocomplete="off"></label>
    <label>API key<input v-model="form.apiKey" type="password" placeholder="Stored only in this browser" autocomplete="off"></label>
    <button class="primary" @click="save">Save settings</button>
    <hr>
    <div class="danger"><div><strong>Reset DOMinic</strong><p>Removes installed apps and locally saved settings.</p></div><button @click="resetOs">Reset OS</button></div>
  </section>
</template>

<style scoped>
.settings-panel { display: grid; gap: 16px; max-width: 540px; padding: 28px; color: #e2e8f0; } header p { margin: 0; color: #67e8f9; font-size: 13px; font-weight: 700; text-transform: uppercase; } h2 { margin: 4px 0 0; font-size: 30px; } label { display: grid; gap: 7px; color: #cbd5e1; font-size: 14px; } input { border: 1px solid #475569; border-radius: 8px; padding: 10px; background: #0f172a; color: white; } button { width: fit-content; border: 0; border-radius: 8px; padding: 10px 14px; cursor: pointer; } .primary { background: #0891b2; color: white; } hr { width: 100%; border: 0; border-top: 1px solid #334155; } .danger { display: flex; align-items: center; justify-content: space-between; gap: 16px; } .danger p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; } .danger button { background: #7f1d1d; color: #fecaca; }
</style>
