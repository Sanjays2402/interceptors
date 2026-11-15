// @vitest-environment node
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { ClientRequestInterceptor } from '.'
import { toWebResponse } from '../../../test/helpers'

/**
 * ESM named imports of builtin modules bind to a snapshot of the module
 * exports taken at import time. Patching `http.request`/`https.request`
 * must still reach those bindings, otherwise the first request made
 * through a named import bypasses interception entirely.
 * @see https://github.com/mswjs/msw/issues/2824
 * @see https://github.com/mswjs/interceptors/issues/201
 */
const interceptor = new ClientRequestInterceptor()

beforeAll(() => {
  interceptor.apply()
})

afterEach(() => {
  interceptor.removeAllListeners()
})

afterAll(() => {
  interceptor.dispose()
})

it('mocks a response to a request made via a named http import', async () => {
  interceptor.on('request', ({ controller }) => {
    controller.respondWith(new Response('hello world'))
  })

  const request = httpRequest('http://localhost/api').end()
  const [response] = await toWebResponse(request)

  expect(response.status).toBe(200)
  await expect(response.text()).resolves.toBe('hello world')
})

it('mocks a response to a request made via a named https import', async () => {
  interceptor.on('request', ({ controller }) => {
    controller.respondWith(new Response('hello world'))
  })

  const request = httpsRequest('https://localhost/api').end()
  const [response] = await toWebResponse(request)

  expect(response.status).toBe(200)
  await expect(response.text()).resolves.toBe('hello world')
})
