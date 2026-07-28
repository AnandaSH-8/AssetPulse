import { useRef, useState } from 'react'
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { financialAPI } from '@/services/api'

export const TEMPLATE_HEADERS = [
  'Title',
  'Category',
  'Cash',
  'Invested',
  'Current',
  'Month',
  'Year',
] as const

export const TEMPLATE_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

type ParsedRow = {
  title: string
  category: string
  cash: number
  invested: number
  current: number
  month: string
  year: number
  error?: string
}

interface Props {
  savedTitles: string[]
  categories: string[]
  cashOnlyCategories: Set<string>
  month: string
  year: string
  monthNumber: number
  isReadOnly: boolean
  onImported: () => void
}

export default function BulkTemplateCard({
  savedTitles,
  categories,
  cashOnlyCategories,
  month,
  year,
  monthNumber,
  isReadOnly,
  onImported,
}: Props) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [open, setOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [conflicts, setConflicts] = useState<{ row: ParsedRow; existing: any }[]>([])

  const validRows = rows.filter(r => !r.error)

  const handleDownload = async () => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Particulars')
    const lists = wb.addWorksheet('Lists')
    lists.state = 'veryHidden'
    categories.forEach((c, i) => {
      lists.getCell(i + 1, 1).value = c
    })
    TEMPLATE_MONTHS.forEach((m, i) => {
      lists.getCell(i + 1, 2).value = m
    })
    const currentYear = new Date().getFullYear()
    const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i)
    YEAR_OPTIONS.forEach((y, i) => {
      lists.getCell(i + 1, 3).value = y
    })

    ws.addRow([...TEMPLATE_HEADERS])
    ws.getRow(1).font = { bold: true }
    ws.columns = [
      { width: 28 },
      { width: 22 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 10 },
    ]

    const titles = savedTitles.length > 0 ? savedTitles : ['']
    titles.forEach(t => ws.addRow([t, '', 0, 0, 0, month, Number(year)]))

    const lastRow = Math.max(ws.rowCount, 200)
    for (let r = 2; r <= lastRow; r++) {
      ws.getCell(r, 2).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Lists!$A$1:$A$${categories.length}`],
        showErrorMessage: true,
        errorTitle: 'Invalid category',
        error: 'Pick a category from the dropdown list.',
      }
      for (const c of [3, 4, 5]) {
        const cell = ws.getCell(r, c)
        if (cell.value === null || cell.value === undefined) cell.value = 0
        cell.numFmt = '#,##0.00'
        cell.dataValidation = {
          type: 'decimal',
          operator: 'greaterThanOrEqual',
          allowBlank: false,
          formulae: [0],
          showErrorMessage: true,
          errorTitle: 'Numbers only',
          error: 'Enter a non-negative number (no text).',
        }
      }

      const monthCell = ws.getCell(r, 6)
      if (!monthCell.value) monthCell.value = month
      monthCell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Lists!$B$1:$B$${TEMPLATE_MONTHS.length}`],
        showErrorMessage: true,
        errorTitle: 'Invalid month',
        error: 'Pick a month from the dropdown list.',
      }

      const yearCell = ws.getCell(r, 7)
      if (!yearCell.value) yearCell.value = Number(year)
      yearCell.numFmt = '0'
      yearCell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`Lists!$C$1:$C$${YEAR_OPTIONS.length}`],
        showErrorMessage: true,
        errorTitle: 'Invalid year',
        error: 'Pick a year from the dropdown list.',
      }
    }


    const buf = await wb.xlsx.writeBuffer()
    const url = URL.createObjectURL(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `AssetPulse_Template_${month}_${year}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Template downloaded',
      description:
        savedTitles.length > 0
          ? `${savedTitles.length} existing titles included. Pick Category from the dropdown and fill amounts.`
          : 'Fill in Title, pick Category from the dropdown, add amounts, then upload it back.',
    })
  }

  const parseNumber = (v: unknown) => {
    if (v === undefined || v === null || String(v).trim() === '') return 0
    if (typeof v === 'number') return Number.isFinite(v) ? v : NaN
    const s = String(v).replace(/[,₹\s]/g, '')
    // strict: digits with optional single decimal part only — any letter/symbol is invalid
    if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN
    return Number(s)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const matrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
        if (!matrix.length) {
          toast({ title: 'Empty file', description: 'The uploaded file has no rows.', variant: 'destructive' })
          return
        }

        // ── Header validation ────────────────────────────────────────────
        const headers = (matrix[0] || []).map(h => String(h ?? '').trim())
        const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
        const expected = TEMPLATE_HEADERS.map(norm)
        const found = headers.filter(h => h !== '').map(norm)
        const missing = TEMPLATE_HEADERS.filter(h => !found.includes(norm(h)))
        const extra = headers.filter(h => h !== '' && !expected.includes(norm(h)))
        if (missing.length || extra.length) {
          toast({
            title: 'Invalid template headers',
            description: [
              missing.length ? `Missing: ${missing.join(', ')}` : '',
              extra.length ? `Unexpected: ${extra.join(', ')}` : '',
              'Please download the template again and do not rename the headers.',
            ]
              .filter(Boolean)
              .join(' — '),
            variant: 'destructive',
          })
          return
        }

        const idx = (name: string) => headers.findIndex(h => norm(h) === norm(name))
        const iTitle = idx('Title')
        const iCat = idx('Category')
        const iCash = idx('Cash')
        const iInv = idx('Invested')
        const iCur = idx('Current')
        const iMonth = idx('Month')
        const iYear = idx('Year')

        const parsed: ParsedRow[] = []
        for (const raw of matrix.slice(1)) {
          const title = String(raw?.[iTitle] ?? '').trim()
          const category = String(raw?.[iCat] ?? '').trim()
          const cash = parseNumber(raw?.[iCash])
          const invested = parseNumber(raw?.[iInv])
          const current = parseNumber(raw?.[iCur])
          const rawMonth = String(raw?.[iMonth] ?? '').trim()
          const rawYear = String(raw?.[iYear] ?? '').trim()

          const rawCash = String(raw?.[iCash] ?? '').trim()
          const rawInv = String(raw?.[iInv] ?? '').trim()
          const rawCur = String(raw?.[iCur] ?? '').trim()
          const amountsUntouched = [rawCash, rawInv, rawCur].every(
            v => v === '' || v === '0' || Number(v) === 0
          )

          // Skip untouched rows (pre-filled titles with zero/blank amounts and no category)
          if (!category && amountsUntouched) continue

          const matchedMonth =
            TEMPLATE_MONTHS.find(m => norm(m) === norm(rawMonth)) || (rawMonth ? '' : month)
          const parsedYear = rawYear === '' ? Number(year) : Number(rawYear)

          let error: string | undefined
          if ([cash, invested, current].some(n => Number.isNaN(n)))
            error = 'Amounts must contain numbers only'
          else if (!title) error = 'Title is required'
          else if (!category) error = 'Category is required'
          else if (!categories.some(c => norm(c) === norm(category)))
            error = `Unknown category "${category}"`
          else if ([cash, invested, current].some(n => n < 0))
            error = 'Amounts cannot be negative'
          else if (!cash && !invested && !current) error = 'Enter at least one amount'
          else if (!matchedMonth) error = `Unknown month "${rawMonth}"`
          else if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2999)
            error = `Invalid year "${rawYear}"`

          const matchedCategory = categories.find(c => norm(c) === norm(category)) || category
          parsed.push({
            title,
            category: matchedCategory,
            cash: Number.isNaN(cash) ? 0 : cash,
            invested: Number.isNaN(invested) ? 0 : invested,
            current: Number.isNaN(current) ? 0 : current,
            month: matchedMonth || rawMonth,
            year: Number.isNaN(parsedYear) ? Number(year) : parsedYear,
            error,
          })
        }


        if (!parsed.length) {
          toast({
            title: 'Nothing to import',
            description: 'The template has headers but no filled-in rows.',
            variant: 'destructive',
          })
          return
        }

        const badNumberRows = parsed
          .map((r, i) => (r.error?.startsWith('Amounts must contain') ? i + 2 : 0))
          .filter(Boolean)
        if (badNumberRows.length) {
          toast({
            title: 'Invalid amounts found',
            description: `Cash, Invested and Current must contain numbers only. Fix row${
              badNumberRows.length > 1 ? 's' : ''
            } ${badNumberRows.join(', ')} and upload again.`,
            variant: 'destructive',
          })
          return
        }

        setRows(parsed)
        setOpen(true)
      } catch {
        toast({
          title: 'Could not read file',
          description: 'Please upload the downloaded CSV template.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsBinaryString(file)
  }

  const findExisting = async () => {
    try {
      const res = await financialAPI.getAll()
      const all: any[] = res?.data ?? []
      const key = (t: string, m: string, y: number | string) =>
        `${String(t).trim().toLowerCase()}|${String(m).trim().toLowerCase()}|${y}`
      const map = new Map<string, any>()
      for (const e of all) map.set(key(e.description ?? '', e.month ?? '', e.year), e)
      const matches: { row: ParsedRow; existing: any }[] = []
      for (const row of validRows) {
        const hit = map.get(key(row.title, row.month, row.year))
        if (hit) matches.push({ row, existing: hit })
      }
      return matches
    } catch {
      return []
    }
  }

  const runImport = async (overwrite: boolean, conflicts: { row: ParsedRow; existing: any }[]) => {
    setIsImporting(true)
    const conflictMap = new Map(conflicts.map(c => [c.row, c.existing]))
    let success = 0
    let failed = 0
    let updated = 0
    let skipped = 0
    for (const row of validRows) {
      const existing = conflictMap.get(row)
      if (existing && !overwrite) {
        skipped++
        continue
      }
      try {
        const isCashOnly = cashOnlyCategories.has(row.category)
        const cash = isCashOnly ? row.cash || row.current : 0
        const invested = isCashOnly ? 0 : row.invested
        const current = isCashOnly ? cash : row.current || row.invested
        const payload = {
          category: row.category,
          description: row.title,
          amount: cash + invested,
          cash,
          investment: invested,
          current_value: current,
          month: row.month,
          month_number: TEMPLATE_MONTHS.indexOf(row.month) + 1 || monthNumber,
          year: row.year,
        }
        if (existing) {
          await financialAPI.update(existing.id, payload)
          updated++
        } else {
          await financialAPI.create(payload)
          success++
        }
      } catch {
        failed++
      }
    }
    setIsImporting(false)
    setConflicts([])
    setOpen(false)
    setRows([])
    toast({
      title: 'Import complete',
      description: [
        `${success} added`,
        updated ? `${updated} overwritten` : '',
        skipped ? `${skipped} skipped (already existed)` : '',
        failed ? `${failed} failed` : '',
      ]
        .filter(Boolean)
        .join(', ') + '.',
      variant: failed ? 'destructive' : 'default',
    })
    if (success || updated) onImported()
  }

  const handleImport = async () => {
    setIsImporting(true)
    const found = await findExisting()
    setIsImporting(false)
    if (found.length) {
      setConflicts(found)
      return
    }
    await runImport(false, [])
  }


  return (
    <>
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Bulk entry via template</h3>
            <p className="text-xs text-muted-foreground">
              Add many assets at once — defaults to {month} {year}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Columns:{' '}
          <span className="font-medium">
            Title, Category, Cash, Invested, Current, Month, Year
          </span>
          . Category, Month and Year are dropdowns in the downloaded Excel template, pre-filled
          with {month} {year}. Do not rename or reorder the header row — it is validated on
          upload.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            type="button"
            className="flex-1 h-11 rounded-xl bg-gradient-primary"
            disabled={isReadOnly}
            title={isReadOnly ? 'Disabled for the demo account' : 'Upload the filled template'}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </GlassCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review template rows</DialogTitle>
            <DialogDescription>
              {validRows.length} of {rows.length} rows are valid and will be saved to the Month
              and Year given in each row. Rows with errors are skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium">Title</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-right p-2 font-medium">Cash</th>
                  <th className="text-right p-2 font-medium">Invested</th>
                  <th className="text-right p-2 font-medium">Current</th>
                  <th className="text-left p-2 font-medium">Period</th>
                  <th className="text-left p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-t border-border ${r.error ? 'bg-destructive/5' : ''}`}
                  >
                    <td className="p-2">{r.title || '—'}</td>
                    <td className="p-2">{r.category || '—'}</td>
                    <td className="p-2 text-right">{r.cash}</td>
                    <td className="p-2 text-right">{r.invested}</td>
                    <td className="p-2 text-right">{r.current}</td>
                    <td className="p-2 whitespace-nowrap">
                      {r.month ? `${r.month.slice(0, 3)}-${r.year}` : '—'}
                    </td>

                    <td className="p-2">
                      {r.error ? (
                        <span className="inline-flex items-center gap-1 text-destructive text-xs">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {r.error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-success text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary"
              onClick={handleImport}
              disabled={isImporting || validRows.length === 0}
            >
              {isImporting ? 'Importing...' : `Import ${validRows.length} row(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={conflicts.length > 0} onOpenChange={o => !o && setConflicts([])}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Existing entries found</DialogTitle>
            <DialogDescription>
              {conflicts.length} row{conflicts.length > 1 ? 's' : ''} already exist for the same
              title and period. Do you want to override them with the uploaded values?
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[40vh] overflow-auto rounded-xl border border-border text-sm">
            <ul className="divide-y divide-border">
              {conflicts.map((c, i) => (
                <li key={i} className="p-2 flex justify-between gap-3">
                  <span className="truncate">{c.row.title}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {c.row.month.slice(0, 3)}-{c.row.year}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={isImporting} onClick={() => runImport(false, conflicts)}>
              Skip existing
            </Button>
            <Button
              className="bg-gradient-primary"
              disabled={isImporting}
              onClick={() => runImport(true, conflicts)}
            >
              {isImporting ? 'Importing...' : 'Override existing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
