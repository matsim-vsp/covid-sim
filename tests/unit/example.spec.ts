import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

// The test checks if the first 5 letters in the first paragraph of the footer are 'COVID'.
describe('App.vue', () => {
  it('checks if the page (footer) loads correctly', () => {
    const wrapper = shallowMount(App, {
      propsData: {},
      stubs: ['router-link', 'router-view'],
    })
    return expect(wrapper.text().substring(0, 5)).toMatch('COVID')
  })
})
