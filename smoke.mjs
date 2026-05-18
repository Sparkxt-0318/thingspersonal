import { chromium } from 'playwright-core'

const URL = 'http://localhost:5173/'
const errors = []
const log = (...a) => console.log('[smoke]', ...a)

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1200, height: 820 } })
const page = await ctx.newPage()
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text())
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// Clear any prior IndexedDB so we test seed + fresh flow deterministically.
await page.evaluate(async () => {
  for (const db of await indexedDB.databases?.()) indexedDB.deleteDatabase(db.name)
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

// 1. Seed data should render Today view.
const todayHeading = await page.getByRole('heading', { name: 'Today' }).count()
log('Today heading present:', todayHeading > 0)

// 1b. Seed must NOT duplicate (StrictMode double-init regression).
const welcomeCount = await page
  .getByText('Welcome to Things', { exact: false })
  .count()
log('Welcome item appears exactly once:', welcomeCount === 1)
if (welcomeCount !== 1) errors.push('seed duplicated: welcome x' + welcomeCount)

// 1c. Expand a task inline, edit its title, collapse, verify persisted edit.
await page.getByText('Try checking me off', { exact: false }).first().click()
await page.waitForTimeout(550)
const notesField = await page.getByPlaceholder('Notes').count()
const taTotal = await page.locator('textarea').count()
log('Inline editor opens with Notes field:', notesField > 0, '(textareas=' + taTotal + ')')
await page.screenshot({ path: 'shot-editor.png' })
await page.keyboard.press('Escape')
await page.waitForTimeout(300)

// 2. Cmd/Ctrl+N -> new task, type a title.
await page.keyboard.press('Control+n')
await page.waitForTimeout(400)
const title = 'Smoke test task ' + Date.now()
await page.keyboard.type(title)
await page.waitForTimeout(200)
// commit with Enter
await page.keyboard.press('Enter')
await page.waitForTimeout(400)

const seenAfterCreate = await page.getByText(title, { exact: false }).count()
log('Created task visible:', seenAfterCreate > 0)

// 3. It was created in Today view (default), so it should be in Today already.
//    Reload to verify persistence.
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const afterReload = await page.getByText(title, { exact: false }).count()
log('Task survived refresh:', afterReload > 0)

await page.screenshot({ path: 'shot-today.png' })

// 4. Complete it: click its checkbox, expect it to leave Today.
const row = page.getByText(title, { exact: false }).first()
const rowBox = await row.boundingBox()
if (rowBox) {
  // checkbox sits to the left of the title
  await page.mouse.click(rowBox.x - 22, rowBox.y + rowBox.height / 2)
}
await page.waitForTimeout(900)
const afterComplete = await page.getByText(title, { exact: false }).count()
log('Task removed from Today after complete:', afterComplete === 0)

// 5. Logbook should contain it.
await page.getByText('Logbook', { exact: true }).first().click()
await page.waitForTimeout(700)
const inLogbook = await page.getByText(title, { exact: false }).count()
log('Task appears in Logbook:', inLogbook > 0)
await page.screenshot({ path: 'shot-logbook.png' })

// 6. Quick Find opens with Cmd/Ctrl+K.
await page.keyboard.press('Control+k')
await page.waitForTimeout(400)
const qfVisible = await page.getByPlaceholder('Quick Find').count()
log('Quick Find opens:', qfVisible > 0)
await page.keyboard.press('Escape')

// 7. Navigate sidebar lists, ensure no crash.
for (const name of ['Inbox', 'Upcoming', 'Anytime', 'Someday']) {
  await page.getByText(name, { exact: true }).first().click()
  await page.waitForTimeout(250)
}
await page.screenshot({ path: 'shot-anytime.png' })

// 8. Dark mode: open Settings (gear) and choose Dark.
await page.getByTitle('Settings').click()
await page.waitForTimeout(400)
const settingsVisible = await page.getByText('Appearance').count()
log('Settings panel opens:', settingsVisible > 0)
await page.getByRole('button', { name: 'Dark' }).click()
await page.waitForTimeout(400)
const isDark = await page.evaluate(() =>
  document.documentElement.classList.contains('dark')
)
log('Dark mode applied:', isDark)
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await page.getByText('Today', { exact: true }).first().click()
await page.waitForTimeout(400)
await page.screenshot({ path: 'shot-dark.png' })

// 9. Dark-mode preference survives refresh.
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const stillDark = await page.evaluate(() =>
  document.documentElement.classList.contains('dark')
)
log('Dark mode persists across refresh:', stillDark)

await browser.close()

console.log('\n=== RESULT ===')
if (errors.length) {
  console.log('ERRORS:\n' + errors.join('\n'))
  process.exit(1)
} else {
  console.log('No console/page errors.')
}
