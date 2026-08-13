import './global.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App.svelte'
import { mount } from 'svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app